import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { asTrimmedString, isValidUrl } from "@/lib/validation";

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
          c.id,
          c.name,
          c.website,
          c.industry,
          c.location,
          c.notes,
          c.created_at,
          c.updated_at,
          COUNT(DISTINCT ct.id) AS contact_count,
          COUNT(DISTINCT a.id) AS application_count
        FROM company c
        LEFT JOIN contact ct ON ct.company_id = c.id
        LEFT JOIN job_application a ON a.company_id = c.id
        WHERE c.user_id = $1
        GROUP BY c.id
        ORDER BY c.name ASC
      `,
      [session.user.id],
    );

    const companies = result.rows.map((row) => ({
      ...row,
      contact_count: Number(row.contact_count),
      application_count: Number(row.application_count),
    }));

    return NextResponse.json({ companies });
  } catch (error) {
    console.error("Failed to fetch companies:", error);

    return NextResponse.json(
      { error: "Unable to load companies." },
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

    const name = asTrimmedString(body.name);
    const website = asTrimmedString(body.website);
    const industry = asTrimmedString(body.industry);
    const location = asTrimmedString(body.location);
    const notes = asTrimmedString(body.notes);

    if (!name || name.length > 200) {
      return NextResponse.json(
        {
          error:
            "Company name is required and must be 200 characters or fewer.",
        },
        { status: 400 },
      );
    }

    if (website && (website.length > 500 || !isValidUrl(website))) {
      return NextResponse.json(
        { error: "Website must be a valid http(s) URL." },
        { status: 400 },
      );
    }

    if (industry && industry.length > 200) {
      return NextResponse.json(
        { error: "Industry must be 200 characters or fewer." },
        { status: 400 },
      );
    }

    if (location && location.length > 200) {
      return NextResponse.json(
        { error: "Location must be 200 characters or fewer." },
        { status: 400 },
      );
    }

    if (notes && notes.length > 2000) {
      return NextResponse.json(
        { error: "Notes must be 2000 characters or fewer." },
        { status: 400 },
      );
    }

    const duplicateCheck = await db.query(
      `SELECT id FROM company WHERE user_id = $1 AND lower(name) = lower($2)`,
      [session.user.id, name],
    );

    if (duplicateCheck.rows.length > 0) {
      return NextResponse.json(
        { error: "You already have a company with this name." },
        { status: 409 },
      );
    }

    const result = await db.query(
      `
        INSERT INTO company (user_id, name, website, industry, location, notes)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING
          id, name, website, industry, location, notes, created_at, updated_at
      `,
      [
        session.user.id,
        name,
        website || null,
        industry || null,
        location || null,
        notes || null,
      ],
    );

    const company = {
      ...result.rows[0],
      contact_count: 0,
      application_count: 0,
    };

    return NextResponse.json({ company }, { status: 201 });
  } catch (error) {
    console.error("Failed to create company:", error);

    return NextResponse.json(
      { error: "Unable to create company." },
      { status: 500 },
    );
  }
}
