import { useEffect, useState } from "react";
import { Detail } from "@raycast/api";
import { getDayName, getMonthName } from "u/getName";
import getWeather from "u/weather";
import fetch from "node-fetch";

interface DayDetailsProps {
  day: number;
  currentMonth: number;
  currentYear: number;
}

function getCurrentTime(): string {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

async function getCurrentLocation(): Promise<string> {
  try {
    const response = await fetch("https://ipapi.co/json/");
    if (!response.ok) {
      throw new Error(`Error fetching location: ${response.statusText}`);
    }
    const data = (await response.json()) as { city: string; country_name: string };
    return `${data.city}, ${data.country_name}`;
  } catch (error) {
    console.error(error);
    return "Unknown location";
  }
}

async function getPublicHolidays(year: number, countryCode: string): Promise<{ date: string; localName: string }[]> {
  try {
    const response = await fetch(`https://www.openholidaysapi.org/en/v1/holidays?year=${year}&country=${countryCode}`);
    if (!response.ok) {
      throw new Error(`Error fetching public holidays: ${response.statusText}`);
    }
    const data = (await response.json()) as { date: string; localName: string }[];
    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export function DayDetails({ day, currentMonth, currentYear }: DayDetailsProps) {
  const [location, setLocation] = useState<string>("Loading location...");
  const [holidays, setHolidays] = useState<{ date: string; localName: string }[]>([]);
  const time = getCurrentTime();
  const weather = getWeather();

  useEffect(() => {
    async function fetchLocation() {
      const loc = await getCurrentLocation();
      setLocation(loc);
    }
    fetchLocation();
  }, []);

  useEffect(() => {
    async function fetchHolidays() {
      const loc = await getCurrentLocation();
      const countryCode = loc.split(", ")[1]; // Assuming country code is part of the location string
      const holidays = await getPublicHolidays(currentYear, countryCode);
      setHolidays(holidays);
    }
    fetchHolidays();
  }, [currentYear]);

  return (
    <Detail
      markdown={`
# ${getDayName(day)} ${day}, ${getMonthName(currentMonth)} ${currentYear}

${time}    ·    ${location}    ·    ${weather}

${holidays.length > 0 ? `<PublicHolidaysTable holidays={holidays} />` : ""}
      `}
    />
  );
}
