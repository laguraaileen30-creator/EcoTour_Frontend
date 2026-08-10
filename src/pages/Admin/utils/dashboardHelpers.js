export const formatCurrency = (amount = 0) => {
  return `₱${Number(amount).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const todayStr = () => {
  return new Date().toISOString().split("T")[0];
};

export const calculateShares = (income = 0, revenueShare = {}) => {
  const barangayPercent = revenueShare.barangayPercent || 0;
  const municipalPercent = revenueShare.municipalPercent || 0;

  const barangay = (income * barangayPercent) / 100;
  const municipal = (income * municipalPercent) / 100;
  const owner = income - barangay - municipal;

  return {
    barangay,
    municipal,
    owner,
  };
};

export const exportToCSV = (rows = [], headers = [], filename = "export.csv") => {
  if (!rows.length) return;

  const csv = [
    headers.join(","),
    ...rows.map(row => headers.map(h => `"${row[h] ?? ""}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};