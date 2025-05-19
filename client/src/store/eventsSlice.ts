import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Event } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface EventsState {
  items: Event[];
  currentEvent: Event | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: EventsState = {
  items: [],
  currentEvent: null,
  status: "idle",
  error: null,
};

export const fetchEvents = createAsyncThunk("events/fetchEvents", async () => {
  const response = await apiRequest("GET", "/api/events");
  return await response.json();
});

export const fetchEventById = createAsyncThunk(
  "events/fetchEventById",
  async (id: number) => {
    const response = await apiRequest("GET", `/api/events/${id}`);
    return await response.json();
  }
);

export const createEvent = createAsyncThunk(
  "events/createEvent",
  async (eventData: Omit<Event, "id" | "createdAt">) => {
    const response = await apiRequest("POST", "/api/events", eventData);
    return await response.json();
  }
);

export const updateEvent = createAsyncThunk(
  "events/updateEvent",
  async ({ id, eventData }: { id: number; eventData: Partial<Event> }) => {
    const response = await apiRequest("PATCH", `/api/events/${id}`, eventData);
    return await response.json();
  }
);

export const deleteEvent = createAsyncThunk(
  "events/deleteEvent",
  async (id: number) => {
    await apiRequest("DELETE", `/api/events/${id}`);
    return id;
  }
);

const eventsSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    clearCurrentEvent(state) {
      state.currentEvent = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchEvents.fulfilled, (state, action: PayloadAction<Event[]>) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch events";
      })
      .addCase(fetchEventById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchEventById.fulfilled, (state, action: PayloadAction<Event>) => {
        state.status = "succeeded";
        state.currentEvent = action.payload;
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch event";
      })
      .addCase(createEvent.fulfilled, (state, action: PayloadAction<Event>) => {
        state.items.push(action.payload);
      })
      .addCase(updateEvent.fulfilled, (state, action: PayloadAction<Event>) => {
        const index = state.items.findIndex((event) => event.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentEvent?.id === action.payload.id) {
          state.currentEvent = action.payload;
        }
      })
      .addCase(deleteEvent.fulfilled, (state, action: PayloadAction<number>) => {
        state.items = state.items.filter((event) => event.id !== action.payload);
        if (state.currentEvent?.id === action.payload) {
          state.currentEvent = null;
        }
      });
  },
});

export const { clearCurrentEvent } = eventsSlice.actions;

export default eventsSlice.reducer;
