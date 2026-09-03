import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isApplicationStatus } from "@/lib/types";

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  try {
    const result = await db.query(
      `
        SELECT
          a.id,
          a.company,
          a.company_id,
          c.name AS company_name,
          a.position,
          a.location,
          a.date_applied,
          a.status,
          a.notes,
          a.created_at,
          a.updated_at
        FROM job_application a
        LEFT JOIN company c ON c.id = a.company_id
        WHERE a.user_id = $1
        ORDER BY a.date_applied DESC, a.id DESC
      `,
      [session.user.id],
    );

    return NextResponse.json({ applications: result.rows });
  } catch (error) {
    console.error("Failed to fetch applications:", error);

    return NextResponse.json(
      { error: "Unable to load applications." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();

    const company = typeof body.company === "string" ? body.company.trim() : "";
    const position =
      typeof body.position === "string" ? body.position.trim() : "";
    const location =
      typeof body.location === "string" ? body.location.trim() : "";
    const notes = typeof body.notes === "string" ? body.notes.trim() : "";
    const status = typeof body.status === "string" ? body.status : "Applied";

    if (!company || !position) {
      return NextResponse.json(
        { error: "Company and position are required." },
        { status: 400 },
      );
    }

    if (!isApplicationStatus(status)) {
      return NextResponse.json(
        { error: "Invalid application status." },
        { status: 400 },
      );
    }

    let companyId: number | null = null;

    if (
      body.companyId !== undefined &&
      body.companyId !== null &&
      body.companyId !== ""
    ) {
      companyId = Number(body.companyId);

      if (!Number.isInteger(companyId)) {
        return NextResponse.json(
          { error: "Invalid company selection." },
          { status: 400 },
        );
      }

      const companyCheck = await db.query(
        `SELECT id FROM company WHERE id = $1 AND user_id = $2`,
        [companyId, session.user.id],
      );

      if (companyCheck.rows.length === 0) {
        return NextResponse.json(
          { error: "Selected company was not found." },
          { status: 400 },
        );
      }
    }

    const result = await db.query(
      `
        INSERT INTO job_application (
          user_id,
          company,
          company_id,
          position,
          location,
          status,
          notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING
          id,
          company,
          company_id,
          position,
          location,
          date_applied,
          status,
          notes,
          created_at,
          updated_at
      `,
      [
        session.user.id,
        company,
        companyId,
        position,
        location || null,
        status,
        notes || null,
      ],
    );

    const application = result.rows[0];

    if (companyId) {
      const companyResult = await db.query(
        `SELECT name FROM company WHERE id = $1`,
        [companyId],
      );
      application.company_name = companyResult.rows[0]?.name ?? null;
    } else {
      application.company_name = null;
    }

    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    console.error("Failed to create application:", error);

    return NextResponse.json(
      { error: "Unable to create application." },
      { status: 500 },
    );
  }
}
