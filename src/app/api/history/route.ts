import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await db.execute({
      sql: 'SELECT * FROM Verification ORDER BY createdAt DESC LIMIT ? OFFSET ?',
      args: [limit, offset],
    });

    const countResult = await db.execute('SELECT COUNT(*) as total FROM Verification');
    const total = Number(countResult.rows[0]?.total ?? 0);

    const formatted = result.rows.map((v) => ({
      id: v.id as string,
      inputType: v.inputType as string,
      inputContent: v.inputContent as string,
      overallScore: v.overallScore as number,
      veracityLevel: v.veracityLevel as string,
      summary: v.summary as string,
      createdAt: v.createdAt as string,
      dimensionScores: {
        sourceCredibility: v.sourceCredibility as number,
        internalCoherence: v.internalCoherence as number,
        externalCorroboration: v.externalCorroboration as number,
        sensationalism: v.sensationalism as number,
        factualAccuracy: v.factualAccuracy as number,
        biasManipulation: v.biasManipulation as number,
      },
    }));

    return NextResponse.json({ verifications: formatted, total });
  } catch (error) {
    console.error('History fetch error:', error);
    return NextResponse.json(
      { error: 'Error al obtener el historial' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    await db.execute({
      sql: 'DELETE FROM Verification WHERE id = ?',
      args: [id],
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la verificación' },
      { status: 500 }
    );
  }
}
