import "./account.css";
import * as React from "react";
import Topbar from "../../topbar/Topbar";
import Sidebar from "../../sidebar/Sidebar";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbar,
} from "@mui/x-data-grid";
import axios, { isAxiosError } from "axios";
import { Button, Stack, TextField } from "@mui/material";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import { Link } from "react-router-dom";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useDemoData } from "@mui/x-data-grid-generator";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { Autocomplete } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";

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

export default function Account() {
  const { data, loading } = useDemoData({
    dataSet: "Commodity",
    rowLength: 4,
    maxColumns: 6,
  });

  const [userData, setUserData] = React.useState([]);

  const [openModal, setOpenModal] = React.useState(false);
  const handleOpen = () => setOpenModal(true);
  const handleClose = () => setOpenModal(false);

  const [updateStatus, setUpdateStatus] = React.useState("");
  const [userEmail, setUserEmail] = React.useState("");
  var test = "testing";

  const requestBody = { isActivate: updateStatus, emailAddress: userEmail };

  const [modalFullName, setModalFullName] = React.useState("");
  const [modalBranch, setModalBranch] = React.useState("");
  const [modalEmail, setModalEmail] = React.useState("");
  const [modalPhone, setModalPhone] = React.useState("");

  const [openDialog, setOpenDialog] = React.useState(false);
  const roleAccount = localStorage.getItem("roleAccount"); // Get roleAccount from localStorage
  const allowedRoles = [
    "ACCOUNT SUPERVISOR",
    "OPERATION OFFICER",
    "OPERATION HEAD",
    "COORDINATOR",
  ];
  const isAllowed = allowedRoles.includes(roleAccount); // Check if role is allowed

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const [outlets, setBranches] = React.useState([
    "Branch",
    "S&R  NUVALI",
    "S&R ALABANG",
    "S&R SUCAT",
    "S&R PARANAQUE",
    "S&R ASEANA",
    "S&R FORT",
    "S&R SHAW",
    "S&R CIRCUIT",
    "S&R NEW MANILA",
    "S&R C5 LIBIS",
    "S&R CONGRESSIONAL",
    "S&R MARIKINA",
    "S&R COMMONNWEALTH",
    "S&R CEBU",
  ]); //Outlets

  // State for the second modal
  const [openBranchModal, setOpenBranchModal] = React.useState(false);
  const handleOpenBranchModal = () => setOpenBranchModal(true);
  const handleCloseBranchModal = () => setOpenBranchModal(false);

  // State for selected branches
  const [selectedBranches, setSelectedBranches] = React.useState([]);

  // Update the outlet of the user with the selected branches

  const handleBranchSave = async () => {
    try {
      // Update the user's branches with the selected branches
      const response = await axios.put(
        "https://api-brewflow.bmphrc.com/update-user-branch",
        {
          email: modalEmail,
          outlet: selectedBranches,
        }
      );

      console.log("User branches updated:", response.data);

      // Update the branch field in the userData state
      const updatedUserData = userData.map((user) => {
        if (user.email === modalEmail) {
          return {
            ...user,
            outlet: selectedBranches.join(", "), // Update the Branch field
          };
        }
        return user;
      });

      setUserData(updatedUserData); // Set the updated userData state

      // After successful update, you might want to refresh the user data
      getUser();
      setTimeout(() => window.location.reload(), 1000);
      handleCloseBranchModal(); // Close the branch selection modal after saving
    } catch (error) {
      console.error("Error updating user branches:", error);
    }
  };

  const capitalizeWords = (words) => {
    if (!words || !Array.isArray(words)) return [];

    return words.map((word) =>
      word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ""
    );
  };

  const columns = [
    { field: "count", headerName: "#", width: 75 },
    {
      field: "firstName",
      headerName: "FIRST NAME",
      width: 150,
      headerClassName: "bold-header",
    },
    {
      field: "middleName",
      headerName: "MIDDLE NAME",
      width: 150,
      headerClassName: "bold-header",
    },
    {
      field: "lastName",
      headerName: "LAST NAME",
      width: 150,
      headerClassName: "bold-header",
    },
    {
      field: "emailAddress",
      headerName: "EMAIL ADDRESS",
      width: 250,
      headerClassName: "bold-header",
    },
    {
      field: "contactNum",
      headerName: "CONTACT NUMBER",
      width: 200,
      headerClassName: "bold-header",
    },
    {
      field: "outlet",
      headerName: "OUTLETS",
      width: 300,
      headerClassName: "bold-header",
    },
    {
      field: "isActive",
      headerName: "STATUS",
      headerClassName: "bold-header",
      width: 150,
      sortable: false,
      disableClickEventBubbling: true,

      renderCell: (params) => {
        const status = params.row.isActive;
        const rowEmail = params.row.emailAddress;
        const roleAccount = localStorage.getItem("roleAccount"); // Get role from localStorage

        const onClick = (e) => {
          if (allowedRoles.includes(roleAccount)) {
            setUpdateStatus(params.row.isActive ? false : true); // Set status based on current state
            setUserEmail(params.row.emailAddress);
            handleOpenDialog(); // Open the dialog
          }
        };

        return (
          <>
            {status ? (
              <Stack>
                <ColorButton
                  variant="contained"
                  size="small"
                  style={{
                    width: "50%",
                    marginTop: "13px",
                    backgroundColor: "#2c1c5c",
                    color: "white",
                  }}
                  onClick={onClick}
                  disabled={!isAllowed}
                >
                  Active
                </ColorButton>
              </Stack>
            ) : (
              <Stack>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  style={{ width: "50%", marginTop: "13px" }}
                  onClick={onClick}
                  disabled={!isAllowed}
                >
                  Inactive
                </Button>
              </Stack>
            )}
          </>
        );
      },
    },
    {
      field: "action",
      headerClassName: "bold-header",
      headerName: "ACTION",
      width: 90,
      sortable: false,
      disableClickEventBubbling: true,

      renderCell: (params) => {
        const onClick = (e) => {
          let mFullname = params.row.firstName + " " + params.row.lastName;
          let condition = params.row.middleName;
          let mOutlet = params.row.outlet;
          let mEmail = params.row.emailAddress;
          let mPhone = params.row.contactNum;
          if (condition === "Null") {
            mFullname = params.row.firstName + " " + params.row.lastName;
          } else {
            mFullname =
              params.row.firstName +
              " " +
              params.row.middleName +
              " " +
              params.row.lastName;
          }

          setModalFullName(mFullname);
          setModalBranch(mOutlet);
          setModalEmail(mEmail);
          setModalPhone(mPhone);

          return handleOpen();
        };

        return (
          <Stack>
            <Button
              variant="contained"
              size="small"
              color="primary"
              onClick={onClick}
              style={{
                width: "50%",
                marginTop: "13px",
                backgroundColor: "#2c1c5c",
                color: "#FFFFF",
              }}
            >
              <PersonIcon />
            </Button>
          </Stack>
        );
      },
    },
  ];

  async function getUser() {
    try {
      const loggedInBranch = localStorage.getItem("outlet");
      console.log("Logged in branch:", loggedInBranch);

      if (!loggedInBranch) {
        console.error("No branch information found for the logged-in admin.");
        return;
      }

      const loggedInBranches = loggedInBranch
        .split(",")
        .map((outlet) => outlet.trim());

      const response = await axios.post(
        "https://api-brewflow.bmphrc.com/get-all-user"
      );
      const data = response.data.data;

      console.log("User data:", data);

      const filteredData = data.filter((item) => {
        console.log("Checking branch for user:", item.outlet);
        return loggedInBranches.some((outlet) => item.outlet?.includes(outlet));
      });

      console.log(filteredData, "filtered user data");

      const newData = filteredData.map((data, key) => {
        const capitalizedNames = capitalizeWords([
          data.firstName,
          data.middleName || "",
          data.lastName,
        ]);

        return {
          count: key + 1,
          outlet: data.outlet,
          firstName: capitalizedNames[0],
          middleName: capitalizedNames[1] || "Null",
          lastName: capitalizedNames[2],
          username: data.username,
          emailAddress: data.email, // now using `email` from updated schema
          contactNum: data.contactNumber, // now using `contactNumber`
          isActive: data.isVerified, // now using `isVerified`
        };
      });

      console.log(newData, "filtered and mapped user data");
      setUserData(newData);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }

  async function setStatus() {
    console.log("check body", requestBody);
    await axios
      .put("https://api-brewflow.bmphrc.com/update-status", requestBody)
      .then(async (response) => {
        const data = await response.data.data;

        console.log(data, "status info");
        window.location.reload();
      });
  }

  React.useEffect(() => {
    getUser();
    if (Array.isArray(modalBranch)) {
      setSelectedBranches(modalBranch); // Pre-select branches based on modalBranch
    }
  }, [modalBranch]);

  return (
    <div className="account">
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
                columns: {
                  columnVisibilityModel: {
                    address: false,
                    phone: false,
                  },
                },
              }}
              slots={{ toolbar: GridToolbar }}
              slotProps={{
                toolbar: {
                  showQuickFilter: true,
                  printOptions: { disableToolbarButton: true },
                  csvOptions: { disableToolbarButton: true },
                },
              }}
              loading={!userData.length}
              disableDensitySelector
              disableColumnFilter
              disableColumnSelector
              pageSizeOptions={[5, 10, 20, 50, 100]}
              getRowId={(row) => row.count}
              disableRowSelectionOnClick
            />
          </Box>

          {/* Responsive Modal */}
          <Modal
            open={openModal}
            onClose={handleCloseDialog}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box
              sx={{
                padding: 4,
                backgroundColor: "white",
                margin: { xs: "10% auto", md: "5% auto" },
                width: { xs: "90%", sm: "70%", md: "50%" },
                boxShadow: 24,
                borderRadius: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Typography id="modal-modal-title" variant="h6" component="h2">
                Full Details:
              </Typography>
              <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                <span className="detailTitle">Full name: </span>
                <span className="detailDescription">{modalFullName}</span>
                <br />
                <span className="detailTitle">Email: </span>
                <span className="detailDescription">{modalEmail}</span>
                <br />
                <span className="detailTitle">Contact Number: </span>
                <span className="detailDescription">{modalPhone}</span>
                <br />
                <span className="detailTitle">Outlets: </span>
                <span className="detailDescription">
                  {Array.isArray(modalBranch)
                    ? modalBranch.join(", ")
                    : modalBranch}
                </span>
                <br />
                <br />
                {/* Button to open branch selection modal */}
                <Button
                  variant="contained"
                  onClick={handleOpenBranchModal}
                  disabled={!isAllowed}
                  sx={{
                    backgroundColor: "#2c1c5c",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "#5c5484",
                    },
                    "&.Mui-disabled": {
                      backgroundColor: "rgba(0, 0, 0, 0.26)",
                      color: "rgba(255, 255, 255, 0.5)",
                    },
                  }}
                >
                  Select Outlet
                </Button>
              </Typography>
              <Stack>
                <DialogActions>
                  <Button onClick={handleClose}>Close</Button>
                </DialogActions>
              </Stack>
            </Box>
          </Modal>

          {/* Branch Selection Dialog */}
          <Dialog
            open={openBranchModal}
            onClose={handleCloseBranchModal}
            aria-labelledby="branch-dialog-title"
            aria-describedby="branch-dialog-description"
            fullWidth
            maxWidth="md"
          >
            <DialogTitle id="branch-dialog-title">Select Branch</DialogTitle>
            <DialogContent>
              <Autocomplete
                multiple
                id="branches-autocomplete"
                options={outlets}
                defaultValue={selectedBranches}
                onChange={(event, value) => setSelectedBranches(value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="Select Branch"
                    placeholder="Select Branch"
                  />
                )}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseBranchModal}>Cancel</Button>
              <Button onClick={handleBranchSave} autoFocus>
                Save
              </Button>
            </DialogActions>
          </Dialog>

          {/* Account Activation Dialog */}
          <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              Account Activation
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                {updateStatus
                  ? "Are you sure you want to set this user as active?"
                  : "Are you sure you want to set this user as inactive?"}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button onClick={setStatus} autoFocus>
                Confirm
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </div>
  );
}

const ColorButton = styled(Button)(({ theme }) => ({
  color: "#000",
  backgroundColor: "#F6FAB9",
  "&:hover": {
    backgroundColor: "#CAE6B2",
  },
}));
