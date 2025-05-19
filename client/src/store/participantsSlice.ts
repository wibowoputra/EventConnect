import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Registration, ParticipantCheckpoint } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface ParticipantsState {
  items: Registration[];
  checkpoints: ParticipantCheckpoint[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: ParticipantsState = {
  items: [],
  checkpoints: [],
  status: "idle",
  error: null,
};

export const fetchParticipantsByEvent = createAsyncThunk(
  "participants/fetchParticipantsByEvent",
  async (eventId: number) => {
    const response = await apiRequest("GET", `/api/registrations?eventId=${eventId}`);
    return await response.json();
  }
);

export const fetchParticipantsByUser = createAsyncThunk(
  "participants/fetchParticipantsByUser",
  async (userId: number) => {
    const response = await apiRequest("GET", `/api/registrations?userId=${userId}`);
    return await response.json();
  }
);

export const createRegistration = createAsyncThunk(
  "participants/createRegistration",
  async (registrationData: Omit<Registration, "id" | "registrationDate">) => {
    const response = await apiRequest("POST", "/api/registrations", registrationData);
    return await response.json();
  }
);

export const updateRegistration = createAsyncThunk(
  "participants/updateRegistration",
  async ({ id, data }: { id: number, data: Partial<Registration> }) => {
    const response = await apiRequest("PATCH", `/api/registrations/${id}`, data);
    return await response.json();
  }
);

export const fetchCheckpoints = createAsyncThunk(
  "participants/fetchCheckpoints",
  async (registrationId: number) => {
    const response = await apiRequest("GET", `/api/participant-checkpoints?registrationId=${registrationId}`);
    return await response.json();
  }
);

export const createCheckpoint = createAsyncThunk(
  "participants/createCheckpoint",
  async (checkpointData: Omit<ParticipantCheckpoint, "id" | "timestamp">) => {
    const response = await apiRequest("POST", "/api/participant-checkpoints", checkpointData);
    return await response.json();
  }
);

export const updateCheckpoint = createAsyncThunk(
  "participants/updateCheckpoint",
  async ({ id, data }: { id: number, data: Partial<ParticipantCheckpoint> }) => {
    const response = await apiRequest("PATCH", `/api/participant-checkpoints/${id}`, data);
    return await response.json();
  }
);

const participantsSlice = createSlice({
  name: "participants",
  initialState,
  reducers: {
    clearParticipants(state) {
      state.items = [];
      state.checkpoints = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchParticipantsByEvent.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchParticipantsByEvent.fulfilled, (state, action: PayloadAction<Registration[]>) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchParticipantsByEvent.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch participants";
      })
      .addCase(fetchParticipantsByUser.fulfilled, (state, action: PayloadAction<Registration[]>) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(createRegistration.fulfilled, (state, action: PayloadAction<Registration>) => {
        state.items.push(action.payload);
      })
      .addCase(updateRegistration.fulfilled, (state, action: PayloadAction<Registration>) => {
        const index = state.items.findIndex((reg) => reg.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(fetchCheckpoints.fulfilled, (state, action: PayloadAction<ParticipantCheckpoint[]>) => {
        state.checkpoints = action.payload;
      })
      .addCase(createCheckpoint.fulfilled, (state, action: PayloadAction<ParticipantCheckpoint>) => {
        state.checkpoints.push(action.payload);
      })
      .addCase(updateCheckpoint.fulfilled, (state, action: PayloadAction<ParticipantCheckpoint>) => {
        const index = state.checkpoints.findIndex((cp) => cp.id === action.payload.id);
        if (index !== -1) {
          state.checkpoints[index] = action.payload;
        }
      });
  },
});

export const { clearParticipants } = participantsSlice.actions;

export default participantsSlice.reducer;
