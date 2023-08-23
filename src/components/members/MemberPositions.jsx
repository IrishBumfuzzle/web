"use client";

import { useState } from "react";

import { DataGrid } from "@mui/x-data-grid";
import {
  Tooltip,
  Button,
  IconButton,
  Typography,
  CircularProgress,
} from "@mui/material";

import Tag from "components/Tag";
import Icon from "components/Icon";

import { useToast } from "components/Toast";
import { useAuth } from "components/AuthProvider";
import { useRouter } from "next/navigation";

export default function MemberPositions({
  editable,
  rows = [],
  setRows = console.log,
  member = {},
  positionEditing = false,
  setPositionEditing = console.log,
}) {
  const { user } = useAuth();

  // position item template
  const emptyPositionItem = {
    name: null,
    startYear: new Date().getFullYear(),
    endYear: null,
  };

  // data manipulation functions
  const onAdd = () => {
    setRows([...rows, { id: rows?.length || 0, ...emptyPositionItem }]);
  };
  const onUpdate = (row) => {
    const newRows = rows.map((r) => {
      if (r.id === row.id) return row;
      return r;
    });
    setRows(newRows);
    return row;
  };
  const onDelete = (row) => {
    setRows(rows.filter((r) => r.id !== row.id));
  };

  // if editing, set position editing to true
  const onEdit = () => {
    setPositionEditing(true);
  };

  // if not editing, set position editing to false
  const onEditStop = () => {
    setPositionEditing(false);
  };

  const columns = [
    {
      field: "name",
      headerName: "Role",
      flex: 4,
      editable: editable,
      renderCell: (p) =>
        p.value ? (
          p.value
        ) : (
          <Typography color="text.secondary">
            <i>Double click to edit</i>
          </Typography>
        ),
    },
    {
      field: "startYear",
      headerName: "Start Year",
      flex: 2,
      editable: editable,
    },
    {
      field: "endYear",
      headerName: "End Year",
      valueGetter: ({ row }) => row.endYear || "-",
      flex: 2,
      editable: editable,
    },
    // if editing, show delete button
    ...(editable
      ? [
          {
            field: "action",
            align: "center",
            headerName: "",
            width: 50,
            renderCell: (p) => (
              <IconButton onClick={() => onDelete(p)} size="small">
                <Icon
                  color="error.main"
                  variant="delete-forever-outline"
                  sx={{ height: 16, width: 16 }}
                />
              </IconButton>
            ),
          },
        ]
      : [
          {
            field: "approved",
            headerName: "Status",
            align: "center",
            headerAlign: "center",
            flex: 2,
            renderCell: ({ value }) => (
              <Tag
                label={value ? "Approved" : "Pending"}
                color={value ? "success" : "warning"}
              />
            ),
          },

          // if not editing and if user is cc, show approve button
          ...(user.role === "cc"
            ? [
                {
                  field: "action",
                  align: "center",
                  headerName: "",
                  width: 50,
                  valueGetter: ({ row }) => ({
                    approved: row.approved,
                    rid: row.rid,
                  }),
                  renderCell: ({ value: { approved, rid } }) => (
                    <ApproveButton
                      approved={approved}
                      rid={rid}
                      member={member}
                    />
                  ),
                },
              ]
            : []),
        ]),
  ];

  return (
    <>
      {editable ? (
        <Button size="small" variant="outlined" onClick={onAdd} sx={{ mb: 1 }}>
          <Icon variant="add" mr={1} />
          Add Item
        </Button>
      ) : null}

      <DataGrid
        autoHeight
        rows={rows}
        columns={columns}
        editMode="row"
        processRowUpdate={onUpdate}
        disableRowSelectionOnClick
        experimentalFeatures={{ newEditingApi: true }}
        onRowEditStart={onEdit}
        onRowEditStop={onEditStop}
        sx={{
          // disable cell selection style
          ".MuiDataGrid-cell:focus": {
            outline: "none",
          },
        }}
        initialState={{
          pagination: { paginationModel: { pageSize: 5 } },
        }}
        pageSizeOptions={[5, 10, 25]}
      />
    </>
  );
}

function ApproveButton({ member, approved, rid }) {
  const router = useRouter();
  const { triggerToast } = useToast();

  const [loading, setLoading] = useState(false);

  const onApprove = async (rid) => {
    const data = {
      cid: member.cid,
      uid: member.uid,
      rid: rid,
    };

    let res = await fetch("/actions/members/approve", {
      method: "POST",
      body: JSON.stringify({ memberInput: data }),
    });
    res = await res.json();

    if (res.ok) {
      // show success toast & refresh server
      triggerToast({
        title: "Success!",
        messages: ["Membership approved."],
        severity: "success",
      });
      setLoading(false);
      router.refresh();
    } else {
      // show error toast
      triggerToast({
        ...res.error,
        severity: "error",
      });
    }
  };

  return approved ? null : (
    <Tooltip arrow title="Approve">
      <IconButton
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          await onApprove(rid);
        }}
        size="small"
        sx={{ border: 1, borderColor: "success.main" }}
      >
        {loading ? (
          <CircularProgress color="success" size={16} />
        ) : (
          <Icon
            color="success.main"
            variant="done"
            sx={{ height: 16, width: 16 }}
          />
        )}
      </IconButton>
    </Tooltip>
  );
}
