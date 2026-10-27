export const iso = (n = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toLocaleDateString("en-CA");
};
export const r2 = (n) => Math.round(n * 100) / 100;
export const peso = (n) =>
  "₱" +
  Number(n || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
export const fdate = (d) =>
  new Date(d + "T00:00").toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
export const daysOver = (due) =>
  Math.round((new Date(iso(0) + "T00:00") - new Date(due + "T00:00")) / 864e5);
export const nextId = (prefix, list, pad) =>
  prefix +
  String(
    Math.max(0, ...list.map((x) => parseInt(x.id.split("-")[1], 10))) + 1,
  ).padStart(pad, "0");
export const calc = (l, pays) => {
  const interest = r2((l.amount * l.rate) / 100),
    total = r2(l.amount + interest),
    paid = r2(pays.reduce((s, p) => s + p.amount, 0));
  const remaining = Math.max(0, r2(total - paid));
  return {
    interest,
    total,
    paid,
    remaining,
    status: remaining <= 0 ? "PAID" : l.due < iso(0) ? "OVERDUE" : "ACTIVE",
  };
};
export const seed = () => {
  const names = [
    ["Juan", "Dela Cruz", "0917-123-4567", "Polangui, Albay"],
    ["Maria", "Santos", "0918-234-5678", "Legazpi City, Albay"],
    ["Pedro", "Garcia", "0919-345-6789", "Daraga, Albay"],
    ["Ana", "Reyes", "0920-456-7890", "Ligao City, Albay"],
    ["Mark", "Flores", "0921-567-8901", "Camalig, Albay"],
    ["Carlo", "Mendoza", "0922-678-9012", "Guinobatan, Albay"],
    ["Sofia", "Ramos", "0923-789-0123", "Tabaco City, Albay"],
    ["Daniel", "Cruz", "0924-890-1234", "Oas, Albay"],
    ["Angela", "Torres", "0925-901-2345", "Polangui, Albay"],
    ["Miguel", "Aquino", "0926-012-3456", "Legazpi City, Albay"],
    ["Juan", "Santos", "0927-111-2222", "Daraga, Albay"],
    ["Juan Miguel", "Reyes", "0928-333-4444", "Ligao City, Albay"],
  ];
  const borrowers = names.map(([first, last, phone, address], i) => ({
    id: "BRW-" + String(i + 1).padStart(3, "0"),
    first,
    last,
    phone,
    address,
  }));
  // [borrower#, amount, rate, loanDate, dueDate, payments[[amount, date, method]]]
  const L = [
    [
      1,
      20000,
      5,
      "2026-09-01",
      "2026-12-01",
      [
        [2000, "2026-09-05", "Cash"],
        [3000, "2026-09-15", "GCash"],
        [6000, "2026-09-22", "Cash"],
        [2000, "2026-09-28", "Cash"],
      ],
    ],
    [
      2,
      15000,
      10,
      iso(-60),
      iso(-2),
      [
        [4500, iso(-45), "Cash"],
        [4500, iso(-30), "GCash"],
        [4500, iso(-15), "Cash"],
      ],
    ],
    [
      3,
      25000,
      8,
      iso(-90),
      iso(-5),
      [
        [10000, iso(-70), "Bank Transfer"],
        [7000, iso(-40), "Cash"],
        [5000, iso(-20), "GCash"],
      ],
    ],
    [
      4,
      10000,
      5,
      iso(-100),
      iso(-10),
      [
        [5000, iso(-80), "Cash"],
        [5500, iso(-50), "GCash"],
      ],
    ],
    [
      5,
      30000,
      6,
      iso(-30),
      iso(60),
      [
        [6000, iso(-20), "Cash"],
        [6000, iso(-8), "GCash"],
      ],
    ],
    [
      6,
      12000,
      10,
      iso(-25),
      iso(30),
      [
        [2200, iso(-15), "Cash"],
        [2200, iso(-4), "Cash"],
      ],
    ],
    [
      7,
      8000,
      5,
      iso(-120),
      iso(-30),
      [
        [4200, iso(-100), "Cash"],
        [4200, iso(-60), "GCash"],
      ],
    ],
    [
      8,
      18000,
      10,
      iso(-75),
      iso(-12),
      [
        [6900, iso(-55), "Cash"],
        [6900, iso(-30), "Bank Transfer"],
      ],
    ],
    [
      9,
      50000,
      4,
      iso(-40),
      iso(45),
      [
        [13000, iso(-25), "Bank Transfer"],
        [13000, iso(-6), "Cash"],
      ],
    ],
    [
      10,
      5000,
      10,
      iso(-90),
      iso(-20),
      [
        [2750, iso(-70), "Cash"],
        [2750, iso(-45), "Cash"],
      ],
    ],
    [11, 10000, 5, iso(-14), iso(50), [[1500, iso(-7), "GCash"]]],
  ];
  const loans = [],
    payments = [];
  L.forEach(([b, amount, rate, date, due, ps], i) => {
    const id = "LN-" + String(i + 1).padStart(3, "0"),
      bid = borrowers[b - 1].id;
    loans.push({ id, bid, amount, rate, date, due, freq: "Monthly" });
    ps.forEach(([a, d, method]) =>
      payments.push({
        id: "PAY-" + String(payments.length + 1).padStart(3, "0"),
        loan: id,
        bid,
        amount: a,
        date: d,
        method,
      }),
    );
  });
  return { borrowers, loans, payments };
};
