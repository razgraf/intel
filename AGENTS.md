Guidance for the agent/model working in this repository.

## Project

Market-watching hub. Designed for tracking stocks, ETFs, crypto, options (stock or crypto), futures, live financial feeds in a clean UI.

## Guidelines

- When adding or editing a new stateful feature make sure they're included in the export/import and account saving system. E.g. a new watchlist item card, a new setting for an item card. Modifying them should save them to our remote redis store and exporting/importing should support the card in its new or modified shape.
