import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { asTrimmedString, isValidUrl } from "@/lib/validation";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
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
    const companyId = Number(id);

    if (!Number.isInteger(companyId)) {
      return NextResponse.json(
        { error: "Invalid company ID." },
        { status: 400 },
      );
    }

    const companyResult = await db.query(
      `
        SELECT id, name, website, industry, location, notes, created_at, updated_at
        FROM company
        WHERE id = $1 AND user_id = $2
      `,
      [companyId, session.user.id],
    );

    if (companyResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Company not found." },
        { status: 404 },
      );
    }

    const contactsResult = await db.query(
      `
        SELECT id, company_id, first_name, last_name, job_title, email, phone, notes, created_at, updated_at
        FROM contact
        WHERE company_id = $1 AND user_id = $2
        ORDER BY last_name ASC, first_name ASC
      `,
      [companyId, session.user.id],
    );

    const applicationsResult = await db.query(
      `
        SELECT id, position, status, date_applied
        FROM job_application
        WHERE company_id = $1 AND user_id = $2
        ORDER BY date_applied DESC
      `,
      [companyId, session.user.id],
    );

    const company = {
      ...companyResult.rows[0],
      contacts: contactsResult.rows,
      applications: applicationsResult.rows,
    };

    return NextResponse.json({ company });
  } catch (error) {
    console.error("Failed to fetch company:", error);

    return NextResponse.json(
      { error: "Unable to load company." },
      { status: 500 },
    );
  }
}

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
    const companyId = Number(id);

    if (!Number.isInteger(companyId)) {
      return NextResponse.json(
        { error: "Invalid company ID." },
        { status: 400 },
      );
    }

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
      `SELECT id FROM company WHERE user_id = $1 AND lower(name) = lower($2) AND id != $3`,
      [session.user.id, name, companyId],
    );

    if (duplicateCheck.rows.length > 0) {
      return NextResponse.json(
        { error: "You already have a company with this name." },
        { status: 409 },
      );
    }

    const result = await db.query(
      `
        UPDATE company
        SET
          name = $1,
          website = $2,
          industry = $3,
          location = $4,
          notes = $5,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $6 AND user_id = $7
        RETURNING id, name, website, industry, location, notes, created_at, updated_at
      `,
      [
        name,
        website || null,
        industry || null,
        location || null,
        notes || null,
        companyId,
        session.user.id,
      ],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Company not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ company: result.rows[0] });
  } catch (error) {
    console.error("Failed to update company:", error);

    return NextResponse.json(
      { error: "Unable to update company." },
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
    const companyId = Number(id);

    if (!Number.isInteger(companyId)) {
      return NextResponse.json(
        { error: "Invalid company ID." },
        { status: 400 },
      );
    }

    const result = await db.query(
      `DELETE FROM company WHERE id = $1 AND user_id = $2 RETURNING id`,
      [companyId, session.user.id],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Company not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete company:", error);

    return NextResponse.json(
      { error: "Unable to delete company." },
      { status: 500 },
    );
  }
}
