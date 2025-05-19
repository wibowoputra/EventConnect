import { configureStore } from "@reduxjs/toolkit";
import eventsReducer from "./eventsSlice";
import participantsReducer from "./participantsSlice";
import racepacksReducer from "./racepacksSlice";

export const store = configureStore({
  reducer: {
    events: eventsReducer,
    participants: participantsReducer,
    racepacks: racepacksReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
