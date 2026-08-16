"use client";

import type { Assignment } from "@/lib/wheel/state";

type Props = {
  assignments: Assignment[];
  onReroll: (rowIndex: number) => void;
};

export function AssignmentTable({ assignments, onReroll }: Props) {
  return (
    <div className="overflow-x-auto rounded-[var(--radius-md)] border border-line bg-surface">
      <table className="w-full text-[0.95rem]">
        <caption className="sr-only">Chore assignments</caption>
        <thead>
          <tr className="bg-surface-2 text-left text-sm">
            <th scope="col" className="px-3 py-2 font-semibold">
              Person
            </th>
            <th scope="col" className="px-3 py-2 font-semibold">
              Chore
            </th>
            <th scope="col" className="px-2 py-2">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {assignments.map((a, i) => {
            const firstOfPerson = i === 0 || assignments[i - 1].person.id !== a.person.id;
            return (
              <tr key={`${a.person.id}-${a.item?.id ?? "free"}-${i}`} className="border-t border-line">
                <td className="px-3 py-2 align-top font-medium">
                  {firstOfPerson ? a.person.name : <span className="sr-only">{a.person.name}</span>}
                </td>
                <td className="px-3 py-2 align-top">{a.item ? a.item.name : <span className="italic text-muted">Free this round</span>}</td>
                <td className="px-2 py-1 text-right align-top">
                  {a.item ? (
                    <button
                      type="button"
                      onClick={() => onReroll(i)}
                      className="min-h-9 rounded px-2 text-sm text-accent hover:bg-accent-soft"
                      aria-label={`Reroll ${a.person.name}'s chore`}
                    >
                      Reroll
                    </button>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
