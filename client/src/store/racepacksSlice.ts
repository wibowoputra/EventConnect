import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RacePack } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface RacePacksState {
  items: RacePack[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: RacePacksState = {
  items: [],
  status: "idle",
  error: null,
};

export const fetchRacePacksByEvent = createAsyncThunk(
  "racepacks/fetchRacePacksByEvent",
  async (eventId: number) => {
    const response = await apiRequest("GET", `/api/race-packs?eventId=${eventId}`);
    return await response.json();
  }
);

export const createRacePack = createAsyncThunk(
  "racepacks/createRacePack",
  async (racePackData: Omit<RacePack, "id">) => {
    const response = await apiRequest("POST", "/api/race-packs", racePackData);
    return await response.json();
  }
);

export const updateRacePack = createAsyncThunk(
  "racepacks/updateRacePack",
  async ({ id, data }: { id: number; data: Partial<RacePack> }) => {
    const response = await apiRequest("PATCH", `/api/race-packs/${id}`, data);
    return await response.json();
  }
);

export const deleteRacePack = createAsyncThunk(
  "racepacks/deleteRacePack",
  async (id: number) => {
    await apiRequest("DELETE", `/api/race-packs/${id}`);
    return id;
  }
);

const racepacksSlice = createSlice({
  name: "racepacks",
  initialState,
  reducers: {
    clearRacePacks(state) {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRacePacksByEvent.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchRacePacksByEvent.fulfilled, (state, action: PayloadAction<RacePack[]>) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchRacePacksByEvent.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch race packs";
      })
      .addCase(createRacePack.fulfilled, (state, action: PayloadAction<RacePack>) => {
        state.items.push(action.payload);
      })
      .addCase(updateRacePack.fulfilled, (state, action: PayloadAction<RacePack>) => {
        const index = state.items.findIndex((pack) => pack.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteRacePack.fulfilled, (state, action: PayloadAction<number>) => {
        state.items = state.items.filter((pack) => pack.id !== action.payload);
      });
  },
});

export const { clearRacePacks } = racepacksSlice.actions;

export default racepacksSlice.reducer;
