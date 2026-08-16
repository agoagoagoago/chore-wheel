"use client";

import type { Assignment } from "@/lib/wheel/state";
import { PrintPortal } from "@/components/ui/PrintPortal";

type Props = {
  title: string;
  assignments: Assignment[] | null;
  date?: Date;
};

/** Print-only rendering of the current assignments (portalled to #print-root). */
export function PrintSheet({ title, assignments, date = new Date() }: Props) {
  if (!assignments || assignments.length === 0) return null;
  const heading = title.trim() || "Chore assignments";
  return (
    <PrintPortal>
      <section>
        <h1>{heading}</h1>
        <p>{date.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
        <table>
          <thead>
            <tr>
              <th style={{ width: "35%" }}>Person</th>
              <th>Chore</th>
              <th style={{ width: "12%" }}>Done</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((a, i) => (
              <tr key={i}>
                <td>{a.person.name}</td>
                <td>{a.item ? a.item.name : "—"}</td>
                <td>☐</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </PrintPortal>
  );
}
