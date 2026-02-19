import { registerWidget } from "./registry";
import { weatherWidget } from "./weather";
import { calendarWidget } from "./calendar";
import { newsWidget } from "./news";
import { healthWidget } from "./health";
import { gamesWidget } from "./games";
import { historyWidget } from "./history";
import { rssWidget } from "./rss";

// Register all widgets on import
registerWidget(weatherWidget);
registerWidget(calendarWidget);
registerWidget(newsWidget);
registerWidget(healthWidget);
registerWidget(gamesWidget);
registerWidget(historyWidget);
registerWidget(rssWidget);

export {
  weatherWidget,
  calendarWidget,
  newsWidget,
  healthWidget,
  gamesWidget,
  historyWidget,
  rssWidget,
};
