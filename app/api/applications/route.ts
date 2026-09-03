import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const allowedStatuses = ["Applied", "Interview", "Offer", "Rejected"] as const;

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
          id,
          company,
          position,
          location,
          date_applied,
          status,
          notes,
          created_at,
          updated_at
        FROM job_application
        WHERE user_id = $1
        ORDER BY date_applied DESC, id DESC
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

    const company =
      typeof body.company === "string" ? body.company.trim() : "";
    const position =
      typeof body.position === "string" ? body.position.trim() : "";
    const location =
      typeof body.location === "string" ? body.location.trim() : "";
    const notes = typeof body.notes === "string" ? body.notes.trim() : "";
    const status =
      typeof body.status === "string" ? body.status : "Applied";

    if (!company || !position) {
      return NextResponse.json(
        { error: "Company and position are required." },
        { status: 400 },
      );
    }

    if (!allowedStatuses.includes(status as (typeof allowedStatuses)[number])) {
      return NextResponse.json(
        { error: "Invalid application status." },
        { status: 400 },
      );
    }

    const result = await db.query(
      `
        INSERT INTO job_application (
          user_id,
          company,
          position,
          location,
          status,
          notes
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING
          id,
          company,
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
        position,
        location || null,
        status,
        notes || null,
      ],
    );

    return NextResponse.json(
      { application: result.rows[0] },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to create application:", error);

    return NextResponse.json(
      { error: "Unable to create application." },
      { status: 500 },
    );
  }
}