import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { asTrimmedString, isValidEmail } from "@/lib/validation";

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
    const { searchParams } = new URL(request.url);
    const companyIdParam = searchParams.get("companyId");

    const conditions = ["ct.user_id = $1"];
    const values: (string | number)[] = [session.user.id];

    if (companyIdParam) {
      const companyId = Number(companyIdParam);

      if (!Number.isInteger(companyId)) {
        return NextResponse.json(
          { error: "Invalid company ID." },
          { status: 400 },
        );
      }

      values.push(companyId);
      conditions.push(`ct.company_id = $${values.length}`);
    }

    const result = await db.query(
      `
        SELECT
          ct.id,
          ct.company_id,
          c.name AS company_name,
          ct.first_name,
          ct.last_name,
          ct.job_title,
          ct.email,
          ct.phone,
          ct.notes,
          ct.created_at,
          ct.updated_at
        FROM contact ct
        JOIN company c ON c.id = ct.company_id
        WHERE ${conditions.join(" AND ")}
        ORDER BY ct.last_name ASC, ct.first_name ASC
      `,
      values,
    );

    return NextResponse.json({ contacts: result.rows });
  } catch (error) {
    console.error("Failed to fetch contacts:", error);

    return NextResponse.json(
      { error: "Unable to load contacts." },
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

    const firstName = asTrimmedString(body.firstName);
    const lastName = asTrimmedString(body.lastName);
    const jobTitle = asTrimmedString(body.jobTitle);
    const email = asTrimmedString(body.email);
    const phone = asTrimmedString(body.phone);
    const notes = asTrimmedString(body.notes);
    const companyId = Number(body.companyId);

    if (!Number.isInteger(companyId)) {
      return NextResponse.json(
        { error: "A company must be selected for this contact." },
        { status: 400 },
      );
    }

    if (!firstName || firstName.length > 100) {
      return NextResponse.json(
        {
          error: "First name is required and must be 100 characters or fewer.",
        },
        { status: 400 },
      );
    }

    if (!lastName || lastName.length > 100) {
      return NextResponse.json(
        { error: "Last name is required and must be 100 characters or fewer." },
        { status: 400 },
      );
    }

    if (jobTitle.length > 200) {
      return NextResponse.json(
        { error: "Job title must be 200 characters or fewer." },
        { status: 400 },
      );
    }

    if (email && (email.length > 255 || !isValidEmail(email))) {
      return NextResponse.json(
        { error: "Email must be a valid email address." },
        { status: 400 },
      );
    }

    if (phone && phone.length > 20) {
      return NextResponse.json(
        { error: "Phone must be 20 characters or fewer." },
        { status: 400 },
      );
    }

    if (notes.length > 1000) {
      return NextResponse.json(
        { error: "Notes must be 1000 characters or fewer." },
        { status: 400 },
      );
    }

    const companyCheck = await db.query(
      `SELECT id FROM company WHERE id = $1 AND user_id = $2`,
      [companyId, session.user.id],
    );

    if (companyCheck.rows.length === 0) {
      return NextResponse.json(
        { error: "Company not found or does not belong to you." },
        { status: 400 },
      );
    }

    const result = await db.query(
      `
        INSERT INTO contact (
          user_id, company_id, first_name, last_name, job_title, email, phone, notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING
          id, company_id, first_name, last_name, job_title, email, phone, notes, created_at, updated_at
      `,
      [
        session.user.id,
        companyId,
        firstName,
        lastName,
        jobTitle || null,
        email || null,
        phone || null,
        notes || null,
      ],
    );

    return NextResponse.json({ contact: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Failed to create contact:", error);

    return NextResponse.json(
      { error: "Unable to create contact." },
      { status: 500 },
    );
  }
}
