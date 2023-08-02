"use client";

import { useRouter } from "next/navigation";

import { useState, useEffect } from "react";

import { useForm, Controller } from "react-hook-form";

import { useToast } from "components/Toast";

import { LoadingButton } from "@mui/lab";
import {
  Button,
  Switch,
  Grid,
  TextField,
  Typography,
  FormHelperText,
  FormControl,
  FormGroup,
  FormControlLabel,
  InputLabel,
  Stack,
  Select,
  MenuItem,
} from "@mui/material";

import Icon from "components/Icon";
import UserImage from "components/users/UserImage";

import MemberPositions from "./MemberPositions";

export default function MemberForm({ defaultValues = {}, action = "log" }) {
  const router = useRouter();

  const { control, watch, setValue, handleSubmit } = useForm({ defaultValues });
  const { triggerToast } = useToast();

  // different form submission handlers
  const submitHandlers = {
    log: console.log,
    create: async (data) => {
      let res = await fetch("/actions/members/create", {
        method: "POST",
        body: JSON.stringify({ memberInput: data }),
      });
      res = await res.json();

      if (res.ok) {
        // show success toast & redirect to manage page
        triggerToast({
          title: "Success!",
          messages: ["Member added."],
          severity: "success",
        });
        router.push(`/manage/members?club=${data.cid}`);
        router.refresh();
      } else {
        // show error toast
        triggerToast({
          ...res.error,
          severity: "error",
        });
      }
    },
    edit: async (data) => {
      let res = await fetch("/actions/members/edit", {
        method: "POST",
        body: JSON.stringify({ memberInput: data }),
      });
      res = await res.json();

      if (res.ok) {
        // show success toast & redirect to manage page
        triggerToast({
          title: "Success!",
          messages: ["Member edited."],
          severity: "success",
        });
        router.push(`/manage/members?club=${data.cid}`);
        router.refresh();
      } else {
        // show error toast
        triggerToast({
          ...res.error,
          severity: "error",
        });
      }
    },
  };

  // transform data and mutate
  async function onSubmit(formData) {
    const data = {
      cid: formData.cid,
      uid: formData.uid,
      poc: formData.poc,
    };

    // show error toast if uid is empty
    if (!data.uid) {
      return triggerToast({
        title: "Error!",
        messages: [
          "User has not been confirmed! Enter a valid email and click the 👍 button to confirm.",
        ],
        severity: "error",
      });
    }

    // convert roles to array of objects with only required attributes
    // remove roles items without a name (they're invalid)
    data.roles = formData.roles
      .filter((i) => i?.name)
      .map((i) => ({
        name: i.name,
        startYear: parseInt(i.startYear),
        endYear: i.endYear === "-" ? null : parseInt(i.endYear),
      }));

    // mutate
    await submitHandlers[action](data);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={4}>
        <Grid container item xs={12} md={7} xl={8} spacing={3}>
          <Grid container item>
            <Grid container item spacing={2}>
              <Grid item xs={12}>
                <MemberClubSelect control={control} watch={watch} />
              </Grid>
            </Grid>
          </Grid>

          <Grid container item>
            <Typography
              variant="subtitle2"
              textTransform="uppercase"
              color="text.secondary"
              gutterBottom
              mb={2}
            >
              User
            </Typography>
            <Grid container item spacing={2}>
              <Grid item xs={12}>
                <MemberUserInput
                  control={control}
                  watch={watch}
                  setValue={setValue}
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid container item>
            <Typography
              variant="subtitle2"
              textTransform="uppercase"
              color="text.secondary"
              gutterBottom
              mb={2}
            >
              Positions
            </Typography>
            <Grid container item spacing={2}>
              <Grid item xs={12}>
                <MemberPositionsTable control={control} watch={watch} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Grid container item xs md spacing={3} alignItems="flex-start">
          <Grid container item>
            <Typography
              variant="subtitle2"
              textTransform="uppercase"
              color="text.secondary"
              gutterBottom
            >
              Other
            </Typography>
            <Grid container item spacing={2}>
              <Grid item xs={12}>
                <MemberPOCSwitch control={control} watch={watch} />
              </Grid>
            </Grid>

            <Grid container item direction="row" xs={12} spacing={2} pt={3}>
              <Grid item xs={6}>
                <Button
                  size="large"
                  variant="outlined"
                  color="secondary"
                  fullWidth
                >
                  Cancel
                </Button>
              </Grid>
              <Grid item xs={6}>
                <LoadingButton
                  type="submit"
                  size="large"
                  variant="contained"
                  color="primary"
                  fullWidth
                >
                  Save
                </LoadingButton>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </form>
  );
}

// find user by email
function MemberUserInput({ control, watch, setValue }) {
  const { triggerToast } = useToast();

  const emailInput = watch("userSelector");
  const [user, setUser] = useState(null);

  const getUser = async () => {
    let res = await fetch("/actions/users/get", {
      method: "POST",
      body: JSON.stringify({ uid: emailInput.split("@")[0] }),
    });
    res = await res.json();

    if (res.ok) {
      // set current user
      setUser(res.data);
      setValue("uid", res.data.email.split("@")[0]);
    } else {
      // show error toast
      triggerToast({
        ...res.error,
        severity: "error",
      });
    }
  };

  return user ? (
    <Stack direction="row" alignItems="center" spacing={4}>
      <UserImage
        image={user.img}
        name={user.firstName}
        gender={user.gender}
        width={80}
        height={80}
      />
      <Stack direction="column" spacing={1}>
        <Typography variant="h4" wordWrap="break-word">
          {user.firstName} {user.lastName}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          fontFamily="monospace"
        >
          {user.email}
        </Typography>
      </Stack>
    </Stack>
  ) : (
    <Controller
      name="userSelector"
      control={control}
      render={({ field }) => (
        <Stack direction="row" spacing={1}>
          <TextField
            {...field}
            type="email"
            label="Email"
            autoComplete="off"
            variant="outlined"
            helperText={
              "Click the 👍 button to confirm the user and verify their email"
            }
            fullWidth
            required
          />
          <Button color="primary" variant="contained" onClick={getUser}>
            <Icon variant="thumb-up-outline-rounded" />
          </Button>
        </Stack>
      )}
    />
  );
}

// select club to which member belongs to
function MemberClubSelect({ control }) {
  const { triggerToast } = useToast();

  // fetch list of clubs
  const [clubs, setClubs] = useState([]);
  useEffect(() => {
    (async () => {
      let res = await fetch("/actions/clubs/ids");
      res = await res.json();
      if (!res.ok) {
        triggerToast({
          title: "Unable to fetch clubs",
          messages: res.error.messages,
          severity: "error",
        });
      } else {
        setClubs(res.data);
      }
    })();
  }, []);

  return (
    <Controller
      name="cid"
      control={control}
      rules={{ required: "Select a club!" }}
      render={({ field, fieldState: { error, invalid } }) => (
        <FormControl fullWidth error={invalid}>
          <InputLabel id="cid">Club *</InputLabel>
          <Select labelId="cid" label="Club *" fullWidth {...field}>
            {clubs
              ?.slice()
              ?.sort((a, b) => a.name.localeCompare(b.name))
              ?.map((club) => (
                <MenuItem key={club.cid} value={club.cid}>
                  {club.name}
                </MenuItem>
              ))}
          </Select>
          <FormHelperText>{error?.message}</FormHelperText>
        </FormControl>
      )}
    />
  );
}

// input event budget as a table
function MemberPositionsTable({ control, watch }) {
  // TODO: watch for uid & cid change, populate table with existing data
  // [AFTER create and edit member mutations have been merged into one]

  return (
    <Controller
      name="roles"
      control={control}
      render={({ field: { value, onChange } }) => (
        <MemberPositions editable rows={value} setRows={onChange} />
      )}
    />
  );
}

// switch for member POC status
function MemberPOCSwitch({ control, watch }) {
  // TODO: watch for uid & cid change, populate table with existing data
  // [AFTER create and edit member mutations have been merged into one]

  return (
    <Controller
      name="poc"
      control={control}
      render={({ field }) => (
        <FormGroup row>
          <FormControlLabel
            value="left"
            control={<Switch color="primary" {...field} />}
            label="Point of Contact"
            labelPlacement="left"
          />
        </FormGroup>
      )}
    />
  );
}
