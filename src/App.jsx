import { useEffect, useMemo, useState } from "react";
import { seed, calc, peso, fdate, daysOver, nextId, iso } from "./data.js";

const KEY = "lms-demo-v1";
const cx = (...a) => a.filter(Boolean).join(" ");
const inp =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200";
const BC = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  PAID: "bg-blue-100 text-blue-700",
  OVERDUE: "bg-red-100 text-red-700",
  "NO LOAN": "bg-slate-100 text-slate-600",
};
const Badge = ({ s }) => (
  <span className={cx("rounded-full px-2.5 py-0.5 text-xs font-bold", BC[s])}>
    {s}
  </span>
);
const Btn = ({ v = "pri", className, ...p }) => (
  <button
    {...p}
    className={cx(
      "rounded-lg px-3 py-2 text-sm font-semibold transition disabled:opacity-50",
      {
        pri: "bg-indigo-600 text-white hover:bg-indigo-700",
        ghost: "border border-slate-300 bg-white hover:bg-slate-100",
        red: "bg-red-600 text-white hover:bg-red-700",
      }[v],
      className,
    )}
  />
);
const Stat = ({ t, v, c = "text-slate-900", sub }) => (
  <div className="rounded-xl border bg-white p-5 shadow-sm">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
      {t}
    </p>
    <p className={cx("mt-1 text-3xl font-bold", c)}>{v}</p>
    {sub && <p className="text-xs text-slate-400">{sub}</p>}
  </div>
);
const Head = ({ t, children }) => (
  <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
    <h1 className="text-2xl font-bold">{t}</h1>
    <div className="flex gap-2">{children}</div>
  </div>
);
const T = ({ heads, rows, empty = "Nothing to show yet." }) => (
  <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
    <table className="w-full text-left text-sm">
      <thead className="bg-slate-50 text-xs uppercase text-slate-500">
        <tr>
          {heads.map((h) => (
            <th key={h} className="whitespace-nowrap px-4 py-3">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y">
        {rows.length ? (
          rows.map((r, i) => (
            <tr key={i} className="hover:bg-slate-50">
              {r.map((c, j) => (
                <td key={j} className="whitespace-nowrap px-4 py-3">
                  {c}
                </td>
              ))}
            </tr>
          ))
        ) : (
          <tr>
            <td
              colSpan={heads.length}
              className="py-10 text-center text-slate-400"
            >
              {empty}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);
const Modal = ({ title, onClose, children }) => (
  <div
    className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-4"
    onClick={onClose}
  >
    <div
      className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="mb-4 text-lg font-bold">{title}</h2>
      {children}
    </div>
  </div>
);
const F = ({ l, children }) => (
  <label className="mb-3 block text-sm">
    <span className="mb-1 block font-medium text-slate-600">{l}</span>
    {children}
  </label>
);
const Foot = ({ err, onClose, label }) => (
  <>
    {err && (
      <p className="mb-3 rounded bg-red-50 p-2 text-sm text-red-700">{err}</p>
    )}
    <div className="flex justify-end gap-2">
      <Btn v="ghost" type="button" onClick={onClose}>
        Cancel
      </Btn>
      <Btn>{label}</Btn>
    </div>
  </>
);

function BorrowerModal({ b, onSave, onClose }) {
  const [v, setV] = useState({
    first: b?.first || "",
    last: b?.last || "",
    phone: b?.phone || "",
    address: b?.address || "",
  });
  const [err, setErr] = useState("");
  const s = (k) => (e) => setV({ ...v, [k]: e.target.value });
  return (
    <Modal title={b ? "Edit Borrower" : "Add Borrower"} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const m = onSave(v);
          m ? setErr(m) : onClose();
        }}
      >
        <F l="First Name">
          <input
            className={inp}
            value={v.first}
            onChange={s("first")}
            autoFocus
          />
        </F>
        <F l="Last Name">
          <input className={inp} value={v.last} onChange={s("last")} />
        </F>
        <F l="Phone Number">
          <input
            className={inp}
            value={v.phone}
            onChange={s("phone")}
            placeholder="0917-123-4567"
          />
        </F>
        <F l="Address">
          <input className={inp} value={v.address} onChange={s("address")} />
        </F>
        <Foot
          err={err}
          onClose={onClose}
          label={b ? "Save Changes" : "Add Borrower"}
        />
      </form>
    </Modal>
  );
}
function LoanModal({ borrowers, bid, onSave, onClose }) {
  const [v, setV] = useState({
    bid: bid || borrowers[0]?.id || "",
    amount: "",
    rate: 5,
    date: iso(0),
    due: iso(90),
    freq: "Monthly",
  });
  const [err, setErr] = useState("");
  const s = (k) => (e) => setV({ ...v, [k]: e.target.value });
  const a = Number(v.amount) || 0,
    i = Math.round(a * (Number(v.rate) || 0)) / 100;
  return (
    <Modal title="Add Loan" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const m = onSave(v);
          m ? setErr(m) : onClose();
        }}
      >
        <F l="Borrower">
          <select className={inp} value={v.bid} onChange={s("bid")}>
            {borrowers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.first} {b.last} ({b.id})
              </option>
            ))}
          </select>
        </F>
        <div className="grid grid-cols-2 gap-3">
          <F l="Loan Amount (₱)">
            <input
              type="number"
              min="1"
              step="0.01"
              className={inp}
              value={v.amount}
              onChange={s("amount")}
            />
          </F>
          <F l="Interest Rate (%)">
            <input
              type="number"
              min="0"
              step="0.01"
              className={inp}
              value={v.rate}
              onChange={s("rate")}
            />
          </F>
          <F l="Loan Date">
            <input
              type="date"
              className={inp}
              value={v.date}
              onChange={s("date")}
            />
          </F>
          <F l="Due Date">
            <input
              type="date"
              className={inp}
              value={v.due}
              onChange={s("due")}
            />
          </F>
        </div>
        <F l="Payment Frequency">
          <select className={inp} value={v.freq} onChange={s("freq")}>
            {["One-time", "Daily", "Weekly", "Biweekly", "Monthly"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </F>
        <div className="mb-4 rounded-lg bg-indigo-50 p-3 text-sm">
          Interest: <b>{peso(i)}</b> · Total Due: <b>{peso(a + i)}</b> ·
          Remaining: <b>{peso(a + i)}</b>
        </div>
        <Foot err={err} onClose={onClose} label="Create Loan" />
      </form>
    </Modal>
  );
}
function PayModal({ loan, onSave, onClose }) {
  const [v, setV] = useState({ amount: "", method: "Cash", date: iso(0) });
  const [err, setErr] = useState("");
  const s = (k) => (e) => setV({ ...v, [k]: e.target.value });
  return (
    <Modal title={`Record Payment · ${loan.id}`} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const m = onSave(loan, v);
          m ? setErr(m) : onClose();
        }}
      >
        <p className="mb-3 text-sm">
          Total Due <b>{peso(loan.total)}</b> · Paid <b>{peso(loan.paid)}</b> ·
          Remaining <b>{peso(loan.remaining)}</b>
        </p>
        <F l="Payment Amount (₱)">
          <input
            type="number"
            step="0.01"
            className={inp}
            value={v.amount}
            onChange={s("amount")}
            autoFocus
          />
        </F>
        <F l="Payment Method">
          <select className={inp} value={v.method} onChange={s("method")}>
            {["Cash", "GCash", "Bank Transfer", "Other"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </F>
        <F l="Date">
          <input
            type="date"
            className={inp}
            value={v.date}
            onChange={s("date")}
          />
        </F>
        <Foot err={err} onClose={onClose} label="Save Payment" />
      </form>
    </Modal>
  );
}

export default function App() {
  const [db, setDb] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || seed();
    } catch {
      return seed();
    }
  });
  useEffect(() => localStorage.setItem(KEY, JSON.stringify(db)), [db]);
  const [page, setPage] = useState({ n: "dashboard" });
  const [nav, setNav] = useState(false);
  const [toast, setToast] = useState("");
  const [modal, setModal] = useState(null);
  const [q, setQ] = useState("");
  const say = (m) => {
    setToast(m);
    setTimeout(() => setToast(""), 2500);
  };
  const go = (n, id) => {
    setPage({ n, id });
    setNav(false);
    window.scrollTo(0, 0);
  };
  const name = (b) => (b ? `${b.first} ${b.last}` : "—");
  const loans = useMemo(
    () =>
      db.loans.map((l) => ({
        ...l,
        ...calc(
          l,
          db.payments.filter((p) => p.loan === l.id),
        ),
        name: name(db.borrowers.find((b) => b.id === l.bid)),
      })),
    [db],
  );
  const rows = useMemo(
    () =>
      db.borrowers.map((b) => {
        const bl = loans.filter((l) => l.bid === b.id),
          open = bl.filter((l) => l.status !== "PAID");
        return {
          ...b,
          bl,
          loanAmt: open.reduce((s, l) => s + l.amount, 0),
          remaining: open.reduce((s, l) => s + l.remaining, 0),
          status: !bl.length
            ? "NO LOAN"
            : bl.some((l) => l.status === "OVERDUE")
              ? "OVERDUE"
              : open.length
                ? "ACTIVE"
                : "PAID",
        };
      }),
    [db, loans],
  );
  const cnt = (s) => loans.filter((l) => l.status === s).length;
  const sum = (k) => loans.reduce((s, l) => s + l[k], 0);

  const saveBorrower = (v, id) => {
    if (!v.first.trim() || !v.last.trim())
      return "First and last name are required.";
    if (v.phone.replace(/\D/g, "").length < 7)
      return "Enter a valid phone number.";
    setDb((d) => ({
      ...d,
      borrowers: id
        ? d.borrowers.map((b) => (b.id === id ? { ...b, ...v } : b))
        : [...d.borrowers, { id: nextId("BRW-", d.borrowers, 3), ...v }],
    }));
    say(id ? "Borrower updated." : "Borrower successfully added.");
  };
  const saveLoan = (v) => {
    const amount = Number(v.amount),
      rate = Number(v.rate);
    if (!(amount > 0)) return "Loan amount must be greater than zero.";
    if (!(rate >= 0)) return "Interest rate cannot be negative.";
    if (!v.date || !v.due || v.due < v.date)
      return "Due date cannot be before loan date.";
    setDb((d) => ({
      ...d,
      loans: [
        ...d.loans,
        {
          id: nextId("LN-", d.loans, 3),
          bid: v.bid,
          amount,
          rate,
          date: v.date,
          due: v.due,
          freq: v.freq,
        },
      ],
    }));
    say("Loan successfully created.");
  };
  const savePay = (loan, v) => {
    const amount = Math.round(Number(v.amount) * 100) / 100;
    if (!(amount > 0)) return "Payment must be greater than zero.";
    if (amount > loan.remaining)
      return `Payment cannot exceed the remaining balance (${peso(loan.remaining)}).`;
    setDb((d) => ({
      ...d,
      payments: [
        ...d.payments,
        {
          id: nextId("PAY-", d.payments, 3),
          loan: loan.id,
          bid: loan.bid,
          amount,
          date: v.date,
          method: v.method,
        },
      ],
    }));
    say("Payment successfully recorded.");
  };
  const delBorrower = (b) => {
    if (
      !confirm(
        `Delete ${name(b)} and all their loans and payments?\nThis cannot be undone.`,
      )
    )
      return;
    setDb((d) => ({
      borrowers: d.borrowers.filter((x) => x.id !== b.id),
      loans: d.loans.filter((x) => x.bid !== b.id),
      payments: d.payments.filter((x) => x.bid !== b.id),
    }));
    say("Borrower deleted.");
    go("borrowers");
  };
  const delLoan = (l) => {
    if (!confirm(`Delete loan ${l.id} and its payments?`)) return;
    setDb((d) => ({
      ...d,
      loans: d.loans.filter((x) => x.id !== l.id),
      payments: d.payments.filter((x) => x.loan !== l.id),
    }));
    say("Loan deleted.");
  };
  const reset = () => {
    if (confirm("Reset all data to the sample data?")) {
      setDb(seed());
      go("dashboard");
      say("Sample data restored.");
    }
  };

  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  const found = rows.filter((b) =>
    terms.every((t) =>
      `${b.first} ${b.last} ${b.id} ${b.phone} ${b.phone.replace(/\D/g, "")}`
        .toLowerCase()
        .includes(t),
    ),
  );
  const view = (b) => (
    <Btn v="ghost" onClick={() => go("details", b.id)}>
      View Details
    </Btn>
  );
  const loanRows = (ls, acts) =>
    ls.map((l) => [
      l.id,
      l.name,
      peso(l.amount),
      peso(l.total),
      peso(l.paid),
      peso(l.remaining),
      fdate(l.due),
      <Badge s={l.status} />,
      ...(acts ? [acts(l)] : []),
    ]);
  const LH = [
    "Loan ID",
    "Borrower",
    "Amount",
    "Total Due",
    "Paid",
    "Remaining",
    "Due Date",
    "Status",
  ];

  let body;
  if (page.n === "dashboard") {
    const recent = [...db.payments]
      .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
      .slice(0, 6);
    body = (
      <>
        <Head t="Dashboard" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat t="Total Borrowers" v={db.borrowers.length} />
          <Stat
            t="Active Loans"
            v={cnt("ACTIVE") + cnt("OVERDUE")}
            c="text-emerald-600"
            sub="includes overdue"
          />
          <Stat t="Overdue Loans" v={cnt("OVERDUE")} c="text-red-600" />
          <Stat t="Paid Loans" v={cnt("PAID")} c="text-blue-600" />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Stat t="Total Lent" v={peso(sum("amount"))} />
          <Stat
            t="Total Collected"
            v={peso(sum("paid"))}
            c="text-emerald-600"
          />
          <Stat
            t="Total Outstanding"
            v={peso(sum("remaining"))}
            c="text-amber-600"
          />
        </div>
        <h2 className="mb-2 mt-8 font-semibold">Recent Payments</h2>
        <T
          heads={["Date", "Borrower", "Loan", "Amount", "Method"]}
          rows={recent.map((p) => [
            fdate(p.date),
            name(db.borrowers.find((b) => b.id === p.bid)),
            p.loan,
            peso(p.amount),
            p.method,
          ])}
        />
      </>
    );
  } else if (page.n === "borrowers") {
    body = (
      <>
        <Head t="Borrowers">
          <Btn onClick={() => setModal({ t: "b" })}>+ Add Borrower</Btn>
        </Head>
        <div className="relative mb-4">
          <span className="absolute left-4 top-3.5">🔍</span>
          <input
            className="w-full rounded-xl border-2 border-slate-300 bg-white py-3.5 pl-11 pr-4 text-lg shadow-sm focus:border-indigo-500 focus:outline-none"
            placeholder="Search borrower by name, ID, or phone number..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoFocus
          />
          {q && (
            <button
              className="absolute right-4 top-3.5 text-slate-400"
              onClick={() => setQ("")}
            >
              ✕
            </button>
          )}
        </div>
        {q && (
          <p className="mb-2 text-sm text-slate-500">
            {found.length} result{found.length !== 1 && "s"}
          </p>
        )}
        <T
          heads={[
            "Borrower ID",
            "Full Name",
            "Phone",
            "Active Loan",
            "Remaining Balance",
            "Status",
            "Actions",
          ]}
          empty="No borrowers match your search."
          rows={found.map((b) => [
            b.id,
            <b>{name(b)}</b>,
            b.phone,
            peso(b.loanAmt),
            peso(b.remaining),
            <Badge s={b.status} />,
            <span className="flex gap-2">
              {view(b)}
              <Btn v="ghost" onClick={() => setModal({ t: "b", b })}>
                Edit
              </Btn>
              <Btn v="red" onClick={() => delBorrower(b)}>
                Delete
              </Btn>
            </span>,
          ])}
        />
      </>
    );
  } else if (page.n === "details") {
    const b = rows.find((x) => x.id === page.id);
    if (!b) {
      go("borrowers");
      return null;
    }
    const ps = db.payments
      .filter((p) => p.bid === b.id)
      .sort((x, y) => y.date.localeCompare(x.date) || y.id.localeCompare(x.id));
    body = (
      <>
        <Head t={name(b).toUpperCase()}>
          <Btn v="ghost" onClick={() => go("borrowers")}>
            ← Back
          </Btn>
          <Btn v="ghost" onClick={() => setModal({ t: "b", b })}>
            Edit
          </Btn>
          <Btn onClick={() => setModal({ t: "l", bid: b.id })}>+ Add Loan</Btn>
        </Head>
        <div className="mb-5 grid gap-2 rounded-xl border bg-white p-5 text-sm shadow-sm sm:grid-cols-3">
          <p>
            <span className="text-slate-500">Borrower ID:</span> <b>{b.id}</b>
          </p>
          <p>
            <span className="text-slate-500">Phone:</span> <b>{b.phone}</b>
          </p>
          <p>
            <span className="text-slate-500">Address:</span>{" "}
            <b>{b.address || "—"}</b>
          </p>
        </div>
        {!b.bl.length && (
          <p className="rounded-xl border border-dashed p-8 text-center text-slate-400">
            No loans yet. Click “+ Add Loan”.
          </p>
        )}
        {b.bl.map((l) => (
          <div
            key={l.id}
            className="mb-4 rounded-xl border bg-white p-5 shadow-sm"
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-bold">LOAN INFORMATION · {l.id}</h3>
              <Badge s={l.status} />
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
              {[
                ["Loan Amount", peso(l.amount)],
                ["Interest", `${peso(l.interest)} (${l.rate}%)`],
                ["Total Due", peso(l.total)],
                ["Total Paid", peso(l.paid)],
                ["Remaining Balance", peso(l.remaining)],
                ["Loan Date", fdate(l.date)],
                ["Due Date", fdate(l.due)],
                ["Frequency", l.freq],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-slate-500">{k}</dt>
                  <dd
                    className={cx(
                      "font-semibold",
                      k === "Remaining Balance" && "text-lg text-amber-600",
                    )}
                  >
                    {v}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 flex gap-2">
              {l.status !== "PAID" && (
                <Btn onClick={() => setModal({ t: "p", id: l.id })}>
                  Record Payment
                </Btn>
              )}
              <Btn v="red" onClick={() => delLoan(l)}>
                Delete Loan
              </Btn>
            </div>
          </div>
        ))}
        <h2 className="mb-2 mt-6 font-semibold">PAYMENT HISTORY</h2>
        <T
          heads={["Date", "Loan", "Amount", "Method"]}
          empty="No payments recorded."
          rows={ps.map((p) => [
            fdate(p.date),
            p.loan,
            peso(p.amount),
            p.method,
          ])}
        />
      </>
    );
  } else if (page.n === "loans") {
    body = (
      <>
        <Head t="Loans">
          <Btn
            onClick={() => setModal({ t: "l" })}
            disabled={!db.borrowers.length}
          >
            + Add Loan
          </Btn>
        </Head>
        <T
          heads={[...LH, "Actions"]}
          rows={loanRows(loans, (l) => (
            <span className="flex gap-2">
              <Btn v="ghost" onClick={() => go("details", l.bid)}>
                View
              </Btn>
              <Btn v="red" onClick={() => delLoan(l)}>
                Delete
              </Btn>
            </span>
          ))}
        />
      </>
    );
  } else if (page.n === "payments") {
    const ps = [...db.payments].sort(
      (a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id),
    );
    body = (
      <>
        <Head t="Payments" />
        <p className="mb-3 text-sm">
          Total collected: <b>{peso(sum("paid"))}</b>
        </p>
        <T
          heads={["Payment ID", "Date", "Borrower", "Loan", "Amount", "Method"]}
          rows={ps.map((p) => [
            p.id,
            fdate(p.date),
            name(db.borrowers.find((b) => b.id === p.bid)),
            p.loan,
            peso(p.amount),
            p.method,
          ])}
        />
      </>
    );
  } else if (page.n === "overdue") {
    const od = loans
      .filter((l) => l.status === "OVERDUE")
      .sort((a, b) => a.due.localeCompare(b.due));
    body = (
      <>
        <Head t="Overdue Loans" />
        {od.length === 0 && (
          <p className="rounded-xl border border-dashed p-8 text-center text-slate-400">
            🎉 No overdue loans.
          </p>
        )}
        <div className="grid gap-3 md:grid-cols-2">
          {od.map((l) => (
            <div
              key={l.id}
              className="rounded-xl border-l-4 border-red-500 bg-white p-4 shadow-sm"
            >
              <p className="text-lg font-bold">{l.name}</p>
              <p className="text-sm text-slate-500">{l.id}</p>
              <p className="mt-2 text-sm">
                Remaining: <b>{peso(l.remaining)}</b>
              </p>
              <p className="text-sm">
                Due Date: <b>{fdate(l.due)}</b>
              </p>
              <p className="mt-1 font-bold text-red-600">
                {daysOver(l.due)} Days Overdue
              </p>
              <Btn
                className="mt-3"
                v="ghost"
                onClick={() => go("details", l.bid)}
              >
                View Details
              </Btn>
            </div>
          ))}
        </div>
      </>
    );
  } else {
    const mx = Math.max(1, sum("total")),
      bar = (t, v, c) => (
        <div key={t} className="mb-3">
          <div className="mb-1 flex justify-between text-sm">
            <span>{t}</span>
            <b>{peso(v)}</b>
          </div>
          <div className="h-4 rounded bg-slate-100">
            <div
              className={cx("h-4 rounded", c)}
              style={{ width: `${(v / mx) * 100}%` }}
            />
          </div>
        </div>
      );
    body = (
      <>
        <Head t="Reports" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat t="Total Loans" v={loans.length} />
          <Stat t="Paid Loans" v={cnt("PAID")} c="text-blue-600" />
          <Stat t="Active Loans" v={cnt("ACTIVE")} c="text-emerald-600" />
          <Stat t="Overdue Loans" v={cnt("OVERDUE")} c="text-red-600" />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Stat t="Total Amount Lent" v={peso(sum("amount"))} />
          <Stat
            t="Total Collected"
            v={peso(sum("paid"))}
            c="text-emerald-600"
          />
          <Stat
            t="Total Outstanding"
            v={peso(sum("remaining"))}
            c="text-amber-600"
          />
        </div>
        <div className="mt-6 rounded-xl border bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-semibold">Money Overview</h3>
          {bar(
            "Total Due (principal + interest)",
            sum("total"),
            "bg-slate-400",
          )}
          {bar("Collected", sum("paid"), "bg-emerald-500")}
          {bar("Outstanding", sum("remaining"), "bg-amber-500")}
        </div>
      </>
    );
  }
  const NAV = [
    ["dashboard", "Dashboard"],
    ["borrowers", "Borrowers"],
    ["loans", "Loans"],
    ["payments", "Payments"],
    ["overdue", "Overdue"],
    ["reports", "Reports"],
  ];
  const side = (
    <>
      <p className="mb-6 px-3 text-lg font-bold text-white">
        💼 Loan Management
        <br />
        <span className="text-xs font-normal text-slate-400">System Demo</span>
      </p>
      <nav className="space-y-1">
        {NAV.map(([n, l]) => (
          <button
            key={n}
            onClick={() => go(n)}
            className={cx(
              "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium",
              page.n === n || (n === "borrowers" && page.n === "details")
                ? "bg-indigo-600 text-white"
                : "text-slate-300 hover:bg-slate-800",
            )}
          >
            {l}
            {n === "overdue" && cnt("OVERDUE") > 0 && (
              <span className="rounded-full bg-red-500 px-2 text-xs text-white">
                {cnt("OVERDUE")}
              </span>
            )}
          </button>
        ))}
        <button
          onClick={reset}
          className="mt-6 w-full rounded-lg px-3 py-2 text-left text-xs text-slate-400 hover:bg-slate-800"
        >
          ↺ Reset sample data
        </button>
      </nav>
    </>
  );
  return (
    <div className="min-h-screen md:flex">
      <aside className="hidden w-60 shrink-0 bg-slate-900 p-4 md:block">
        {side}
      </aside>
      <header className="flex items-center justify-between bg-slate-900 p-3 text-white md:hidden">
        <b>💼 Loan Management</b>
        <button className="px-2 text-xl" onClick={() => setNav(!nav)}>
          ☰
        </button>
      </header>
      {nav && <div className="bg-slate-900 p-4 md:hidden">{side}</div>}
      <main className="min-w-0 flex-1 p-4 md:p-8">{body}</main>
      {modal?.t === "b" && (
        <BorrowerModal
          b={modal.b}
          onSave={(v) => saveBorrower(v, modal.b?.id)}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.t === "l" && (
        <LoanModal
          borrowers={db.borrowers}
          bid={modal.bid}
          onSave={saveLoan}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.t === "p" && (
        <PayModal
          loan={loans.find((l) => l.id === modal.id)}
          onSave={savePay}
          onClose={() => setModal(null)}
        />
      )}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-medium text-white shadow-lg">
          ✓ {toast}
        </div>
      )}
    </div>
  );
}
