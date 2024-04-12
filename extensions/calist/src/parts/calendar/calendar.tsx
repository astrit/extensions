import { useContext, useState } from "react";
import { Grid } from "@raycast/api";
import { updateCommandMetadata } from "@raycast/api";
import { Context } from "u/context";
import { useTitle } from "u/useTitle";
import Dropdown from "@/dropdow/dropdown";
import Time from "@/time/time";
import getViewMode from "u/getViewMode";
import Month from "@/month/month";
import Actions from "@/actions/actions";
import { searchPlaceholder, monthDropdown } from "u/options";
import { getMonthName } from "u/getDate";
import { getWeek } from "date-fns";
import { getSelection } from "u/getSelection";
import getMonthNumber from "u/getMonthNumber";

export default function Calendar() {
  const {
    currentYear,
    currentWeek,
    currentDay,
    currentMonth,
    setCurrentMonth,
    setCurrentWeek,
    setCurrentYear,
    enableWeek,
    enableTimer,
    setSelectedDay,
    selectedDay,
  } = useContext(Context);
  const [isTimerHidden, setIsTimerHidden] = useState(false);
  const setViewMode = getViewMode();

  const titleNav = useTitle({
    month: currentMonth,
    year: currentYear,
    week: currentWeek,
    day: selectedDay,
    weather: true,
  });

  const titleCommand = useTitle({
    weather: true,
    day: currentDay,
  });

  const placeHolder = searchPlaceholder ? searchPlaceholder : `Search ${getMonthName(currentMonth - 1)}`;

  updateCommandMetadata({ subtitle: titleCommand });

  const handleSearchTextChange = (searchText: string) => {
    setIsTimerHidden(searchText.length > 0);

    if (searchText.length === 0) {
      const currentDate = new Date();
      setCurrentMonth(currentDate.getMonth() + 1);
      setCurrentYear(currentDate.getFullYear());
    } else {
      const [potentialMonth, potentialYear] = searchText.split(" ");
      const monthNumber = Number(potentialMonth);
      if (!isNaN(monthNumber) && monthNumber >= 1 && monthNumber <= 12) {
        setCurrentMonth(monthNumber);
      } else {
        const monthNumberFromName = getMonthNumber(potentialMonth);
        if (monthNumberFromName !== -1) {
          setCurrentMonth(monthNumberFromName);
        }
      }
      const yearNumber = Number(potentialYear);
      if (!isNaN(yearNumber) && yearNumber >= 1900 && yearNumber <= 2100) {
        setCurrentYear(yearNumber);
      }
    }
  };

  return (
    <Grid
      columns={enableWeek ? 8 : 7}
      inset={Grid.Inset.Small}
      aspectRatio={setViewMode}
      searchBarPlaceholder={placeHolder}
      navigationTitle={titleNav}
      searchBarAccessory={monthDropdown ? <Dropdown /> : undefined}
      actions={<Actions />}
      onSearchTextChange={handleSearchTextChange}
      onSelectionChange={(id) => {
        getSelection(id, setCurrentWeek, setSelectedDay, getWeek, currentYear, currentMonth);
      }}
    >
      {enableTimer && !isTimerHidden && <Time />}
      <Month />
    </Grid>
  );
}
