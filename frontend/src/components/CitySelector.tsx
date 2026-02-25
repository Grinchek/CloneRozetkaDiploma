import { useState, useEffect, useRef } from "react";
import { useCity } from "../context/CityContext";

const UKRAINIAN_CITIES: string[] = [
  "Київ",
  "Вінниця",
  "Луцьк",
  "Дніпро",
  "Донецьк",
  "Житомир",
  "Ужгород",
  "Запоріжжя",
  "Івано-Франківськ",
  "Кропивницький",
  "Луганськ",
  "Львів",
  "Миколаїв",
  "Одеса",
  "Полтава",
  "Рівне",
  "Суми",
  "Тернопіль",
  "Харків",
  "Херсон",
  "Хмельницький",
  "Черкаси",
  "Чернівці",
  "Чернігів",
];

export default function CitySelector() {
  const { selectedCity, setSelectedCity } = useCity();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredCities = UKRAINIAN_CITIES.filter((city) =>
    city.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (city: string) => {
    setSelectedCity(city);
    setSearchQuery("");
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 text-[#F5A623] hover:opacity-90 transition-opacity text-sm max-w-[180px]"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={selectedCity ? `Місто: ${selectedCity}` : "Обрати місто"}
      >
        <img src="/icons/navbar-location-line.svg" alt="" aria-hidden />
        <span className="truncate">
          {selectedCity || ""}
        </span>
      </button>

      {isOpen && (
        <div
          className="absolute left-0 top-full mt-2 z-50 w-72 rounded-lg bg-[#4E4B3D] border border-[#404236] shadow-xl py-2"
          role="listbox"
        >
          <div className="px-3 pb-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Пошук міста..."
              className="w-full h-9 rounded-md bg-[#404236] px-3 text-sm text-white placeholder:text-[#FFD89F]/60 outline-none border border-transparent focus:border-[#F5A623]"
              autoFocus
              aria-label="Пошук міста"
            />
          </div>
          <ul className="max-h-64 overflow-y-auto">
            {filteredCities.length === 0 ? (
              <li className="px-4 py-3 text-sm text-[#FFD89F]/70">
                Міст не знайдено
              </li>
            ) : (
              filteredCities.map((city) => (
                <li key={city}>
                  <button
                    type="button"
                    onClick={() => handleSelect(city)}
                    className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                      selectedCity === city
                        ? "bg-[#F5A623]/20 text-[#F5A623] font-medium"
                        : "text-[#F1F1F1] hover:bg-[#404236]"
                    }`}
                    role="option"
                    aria-selected={selectedCity === city}
                  >
                    {city}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
