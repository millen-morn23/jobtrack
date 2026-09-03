import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isApplicationStatus } from "@/lib/types";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
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
    const { id } = await context.params;
    const applicationId = Number(id);

    if (!Number.isInteger(applicationId)) {
      return NextResponse.json(
        { error: "Invalid application ID." },
        { status: 400 },
      );
    }

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
        UPDATE job_application
        SET
          company = $1,
          company_id = $2,
          position = $3,
          location = $4,
          status = $5,
          notes = $6,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $7
          AND user_id = $8
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
        company,
        companyId,
        position,
        location || null,
        status,
        notes || null,
        applicationId,
        session.user.id,
      ],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Application not found." },
        { status: 404 },
      );
    }

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

    return NextResponse.json({ application });
  } catch (error) {
    console.error("Failed to update application:", error);

    return NextResponse.json(
      { error: "Unable to update application." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
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
    const { id } = await context.params;
    const applicationId = Number(id);

    if (!Number.isInteger(applicationId)) {
      return NextResponse.json(
        { error: "Invalid application ID." },
        { status: 400 },
      );
    }

    const result = await db.query(
      `
        DELETE FROM job_application
        WHERE id = $1
          AND user_id = $2
        RETURNING id
      `,
      [applicationId, session.user.id],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Application not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Failed to delete application:", error);

    return NextResponse.json(
      { error: "Unable to delete application." },
      { status: 500 },
    );
  }
}
