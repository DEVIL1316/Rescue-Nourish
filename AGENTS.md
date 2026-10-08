## Architecture decisions

- Group chat history and delivery use authenticated database RPCs and persisted message rows so notifications and chat share one source of truth.