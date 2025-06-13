import "./inventoryStyle.css";
import * as React from "react";
import Topbar from "../../topbar/Topbar";
import Sidebar from "../../sidebar/Sidebar";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbar,
} from "@mui/x-data-grid";
import axios from "axios";
import { Button, Stack, buttonBaseClasses } from "@mui/material";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import { Link } from "react-router-dom";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarExport />
    </GridToolbarContainer>
  );
}

export default function Inventory() {
  const [userData, setUserData] = React.useState([]);
  const [dateFilter, setDateFilter] = React.useState(null);
  const body = { test: "test" };
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const XLSX = require("sheetjs-style");
  const [dateBegin, setDateBegin] = React.useState(null);
  const [dateEnd, setDateEnd] = React.useState(null);

  const filterParcelDate = () => {
    //let selectedDate = new Date(dateFilter.$d).toLocaleString('en-us',{month:'numeric', timeZone: 'Asia/Manila'});
    let month = new Date(dateFilter.$d).toLocaleString("en-us", {
      month: "numeric",
      timeZone: "Asia/Manila",
    });
    let day = new Date(dateFilter.$d).toLocaleString("en-us", {
      day: "numeric",
      timeZone: "Asia/Manila",
    });
    let year = new Date(dateFilter.$d).toLocaleString("en-us", {
      year: "numeric",
      timeZone: "Asia/Manila",
    });

    if (month.length === 1) month = "0" + month;
    if (day.length === 1) day = "0" + day;

    const selectedDate = year + "-" + month + "-" + day;
    console.log(selectedDate);
    getDate(selectedDate);
  };

  const columns = [
    {
      field: "count",
      headerName: "#",
      width: 80,
      headerClassName: "bold-header",
    },
    {
      field: "date",
      headerName: "Date",
      width: 150,
      headerClassName: "bold-header",
    },
    {
      field: "merchandiser",
      headerName: "Merchandiser",
      width: 150,
      headerClassName: "bold-header",
    },
    {
      field: "email",
      headerName: "Email",
      width: 250,
      headerClassName: "bold-header",
    },
    {
      field: "outlet",
      headerName: "Outlet",
      width: 200,
      headerClassName: "bold-header",
    },
    {
      field: "weeksCovered",
      headerName: "Weeks Covered",
      width: 150,
      headerClassName: "bold-header",
    },
    {
      field: "month",
      headerName: "Month",
      width: 120,
      headerClassName: "bold-header",
    },
    {
      field: "week",
      headerName: "Week",
      width: 100,
      headerClassName: "bold-header",
    },
    {
      field: "sku",
      headerName: "SKU",
      width: 350,
      headerClassName: "bold-header",
    },
    // {
    //   field: "skuCode",
    //   headerName: "SKU Code",
    //   width: 150,
    //   headerClassName: "bold-header",
    // },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      headerClassName: "bold-header",
    },
    {
      field: "beginningPCS",
      headerName: "Beginning (PCS)",
      width: 180,
      headerClassName: "bold-header",
    },
    {
      field: "deliveryPCS",
      headerName: "Delivery (PCS)",
      width: 150,
      headerClassName: "bold-header",
    },
    {
      field: "endingPCS",
      headerName: "Ending (PCS)",
      width: 150,
      headerClassName: "bold-header",
    },
    {
      field: "offtake",
      headerName: "Offtake",
      width: 130,
      headerClassName: "bold-header",
    },
    {
      field: "inventoryDays",
      headerName: "Inventory Days",
      width: 180,
      headerClassName: "bold-header",
    },
    {
      field: "expiryMonths",
      headerName: "Expiry Month",
      width: 180,
      headerClassName: "bold-header",
    },
    {
      field: "expiryQty",
      headerName: "Expiry Qty",
      width: 150,
      headerClassName: "bold-header",
    },
  ];

  async function getUser() {
    try {
      const outlet = localStorage.getItem("outlet")?.split(",");
      if (!outlet) {
        console.error("No branch information found");
        return;
      }

      const response = await axios.post(
        "https://react-brewflow-backend.onrender.com/retrieve-inventory-data",
        { outlet }
      );

      const sortedData = response.data.data.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      let globalCount = 1;
      const newData = sortedData.flatMap((entry) => {
        const { versions, ...rest } = entry;
        return Object.entries(versions || {}).flatMap(
          ([versionKey, versionData]) => {
            if (!versionData) return [];

            const result = [];
            const pushSku = (sku, status, values = {}) => {
              result.push({
                id: `${status.toLowerCase()}-${sku.skuCode}-${versionKey}-${
                  rest.date
                }-${rest.outlet}`,
                count: globalCount++,
                version: versionKey,
                status,
                ...rest,
                sku: sku.sku,
                skuCode: sku.skuCode,
                ...values,
              });
            };

            versionData.Carried?.forEach((sku) =>
              pushSku(sku, "Carried", {
                beginningPCS: sku.beginningPCS ?? 0,
                deliveryPCS: sku.deliveryPCS ?? 0,
                endingPCS: sku.endingPCS ?? 0,
                offtake: sku.offtake ?? 0,
                inventoryDays: sku.inventoryDays ?? 0,
                expiryMonths: sku.expiryMonths || "",
                expiryQty: sku.expiryQty ?? 0,
              })
            );

            versionData["Not Carried"]?.forEach((sku) =>
              pushSku(sku, "Not Carried", {
                beginningPCS: "NC",
                deliveryPCS: "NC",
                endingPCS: "NC",
                offtake: "NC",
                inventoryDays: "NC",
                expiryMonths: "",
                expiryQty: "NC",
              })
            );

            versionData.Delisted?.forEach((sku) =>
              pushSku(sku, "Delisted", {
                beginningPCS: "Delisted",
                deliveryPCS: "Delisted",
                endingPCS: "Delisted",
                offtake: "Delisted",
                inventoryDays: "Delisted",
                expiryMonths: "",
                expiryQty: "Delisted",
              })
            );

            return result;
          }
        );
      });

      console.log(
        "Final data with counts:",
        newData.map((item) => ({
          id: item.id,
          count: item.count,
          sku: item.sku,
          status: item.status,
        }))
      );

      setUserData(newData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  const fetchInventoryByDate = async () => {
    if (!dateBegin || !dateEnd) {
      alert("Please select a valid date range.");
      return;
    }

    const selectedDate = {
      startDate: dateBegin.format("YYYY-MM-DD"),
      endDate: dateEnd.format("YYYY-MM-DD"),
    };

    console.log("Sending date range to backend:", selectedDate);
    await getDate(selectedDate);
  };

  async function getDate({ startDate, endDate }) {
    try {
      const { data } = await axios.post(
        "https://react-brewflow-backend.onrender.com/filter-date-range",
        { startDate, endDate }
      );

      const inventories = data.data || [];
      console.log("Inventory fetched:", inventories.length);

      /* New flat array */
      const flat = [];

      inventories
        .sort((a, b) => new Date(b.date) - new Date(a.date)) // newest first
        .forEach((inv) => {
          const version = inv.versions?.SKU;
          if (!version) return; // safety guard

          ["Carried", "Not Carried", "Delisted"].forEach((status) => {
            const items = version[status] || [];
            items.forEach((item) => {
              flat.push({
                count: flat.length + 1,
                date: inv.date,
                merchandiser: inv.merchandiser,
                email: inv.email,
                outlet: inv.outlet,
                weeksCovered: inv.weeksCovered,
                month: inv.month,
                week: inv.week,
                version: "SKU", // keep a version column if you need it
                status,

                sku: item.sku,
                skuCode: item.skuCode,

                beginning:
                  status === "Carried" ? item.beginningPCS ?? 0 : status,
                delivery: status === "Carried" ? item.deliveryPCS ?? 0 : status,
                ending: status === "Carried" ? item.endingPCS ?? 0 : status,
                offtake: status === "Carried" ? item.offtake ?? 0 : status,
                inventoryDaysLevel:
                  status === "Carried" ? item.inventoryDays ?? 0 : status,
                expiryMonths:
                  status === "Carried" ? item.expiryMonths ?? "" : "",
                expiryQty: status === "Carried" ? item.expiryQty ?? 0 : "",
              });
            });
          });
        });

      console.log("Mapped data:", flat.length);
      setUserData(flat); // update UI table / list
    } catch (err) {
      console.error("Error fetching inventory data:", err);
      alert("Unable to fetch inventory. Please try again.");
    }
  }

  React.useEffect(() => {
    getUser();
  }, []);

  const getExportData = async () => {
    if (!dateBegin || !dateEnd) {
      alert("Please fill date fields");
      return;
    }

    const bDate = dateBegin.$d.getTime();
    const eDate = dateEnd.$d.getTime();
    if (eDate < bDate) {
      alert("End date must be ahead of or the same as the start date");
      return;
    }

    try {
      const { data } = await axios.post(
        "https://react-brewflow-backend.onrender.com/export-inventory",
        {
          start: bDate,
          end: eDate,
        }
      );

      const headers = [
        "#",
        "Date",
        "Fullname",
        "Outlet",
        "Weeks Covered",
        "Month",
        "Week",
        "SKU",
        "SKU CODE",
        "Status",
        "Beginning",
        "Delivery",
        "Ending",
        "Expiry Month",
        "Expiry Qty",
        "Offtake",
        "Inventory Days Level",
      ];

      const rows = data.data.map((item) => ({
        "#": item.count,
        Date: item.date,
        Fullname: item.fullname,
        Outlet: item.outlet,
        "Weeks Covered": item.weeksCovered,
        Month: item.month,
        Week: item.week,
        SKU: item.sku,
        "SKU CODE": item.skuCode,
        Status: item.status,

        Beginning: item.beginning,
        Delivery: item.delivery,
        Ending: item.ending,

        "Expiry Month": item.expiryMonth,
        "Expiry Qty": item.expiryQty,

        Offtake: item.offtake,
        "Inventory Days Level":
          typeof item.inventoryDays === "number"
            ? item.inventoryDays.toFixed(2)
            : item.inventoryDays,
      }));

      /* ---------- Excel build (unchanged layout logic) ---------- */
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet([]);
      XLSX.utils.sheet_add_aoa(ws, [headers], { origin: "A1" });
      XLSX.utils.sheet_add_json(ws, rows, { origin: "A2", skipHeader: true });

      ws["!cols"] = headers.map((h, i) => {
        const max = Math.max(
          h.length,
          ...rows.map((r) => (r[h] || "").toString().length)
        );
        return { wch: max + 4 };
      });

      // bold header + center alignment
      headers.forEach((_, c) => {
        const cell = XLSX.utils.encode_cell({ r: 0, c });
        if (ws[cell]) {
          ws[cell].s = {
            font: { bold: true },
            alignment: { horizontal: "center", vertical: "center" },
          };
        }
      });
      rows.forEach((_, r) =>
        headers.forEach((_, c) => {
          const cell = XLSX.utils.encode_cell({ r: r + 1, c });
          if (ws[cell])
            ws[cell].s = {
              alignment: { horizontal: "center", vertical: "center" },
            };
        })
      );

      XLSX.utils.book_append_sheet(wb, ws, "Inventory_Data");
      const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });

      const blob = new Blob([buf], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `INVENTORY_DATA_TOWI_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert("Error exporting data. Please try again.");
    }
  };

  return (
    <div className="attendance">
      <Topbar />
      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" } }}>
        <Sidebar />
        <Box
          sx={{
            flexGrow: 1,
            padding: { xs: "10px", sm: "20px" },
            maxWidth: "100%",
            overflow: "auto",
            backgroundColor: "#f0f8ff",
          }}
        >
          {/* Responsive Header with Controls */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{ marginBottom: "20px" }}
          >
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Start Date"
                onChange={(newValue) => setDateBegin(newValue)}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: false,
                    sx: { backgroundColor: "white" },
                  },
                }}
              />
            </LocalizationProvider>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="End Date"
                onChange={(newValue) => setDateEnd(newValue)}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: false,
                    sx: { backgroundColor: "white" },
                  },
                }}
              />
            </LocalizationProvider>

            <Button
              onClick={getExportData}
              variant="contained"
              sx={{
                backgroundColor: "#2c1c5c",
                color: "#FFFFFF",
                "&:hover": {
                  backgroundColor: "#5c5484",
                },
              }}
            >
              Export
            </Button>

            <Button
              onClick={fetchInventoryByDate}
              variant="contained"
              sx={{
                backgroundColor: "rgb(25, 118, 210)",
                color: "white",
                "&:hover": {
                  backgroundColor: "rgb(21, 101, 192)",
                },
              }}
            >
              Show Inventory
            </Button>
          </Stack>

          {/* Responsive DataGrid */}
          <Box
            sx={{
              height: "100%",
              width: "100%",
              maxHeight: "80vh",
              marginTop: 2,
              overflow: "hidden",
              "& .MuiDataGrid-root": {
                backgroundColor: "#fff",
              },
            }}
          >
            <DataGrid
              rows={userData}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 },
                },
              }}
              slots={{
                toolbar: GridToolbar,
              }}
              slotProps={{
                toolbar: {
                  showQuickFilter: true,
                  printOptions: { disableToolbarButton: true },
                  csvOptions: { disableToolbarButton: false },
                },
              }}
              disableDensitySelector
              disableColumnFilter
              disableColumnSelector
              disableRowSelectionOnClick
              pageSizeOptions={[5, 10, 20, 30, 50, 100]}
              getRowId={(row) => row.count}
            />
          </Box>
        </Box>
      </Box>
    </div>
  );
}
