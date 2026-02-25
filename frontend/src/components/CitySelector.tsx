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
    <div className="city-selector" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="city-selector__trigger"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={selectedCity ? `Місто: ${selectedCity}` : "Обрати місто"}
      >
        <img src="/icons/navbar-location-line.svg" alt="" aria-hidden />
        <span>{selectedCity || "Місто"}</span>
      </button>

      {isOpen && (
        <div className="city-selector__dropdown" role="listbox">
          <div className="city-selector__search-wrap">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Пошук міста..."
              className="city-selector__search"
              autoFocus
              aria-label="Пошук міста"
            />
          </div>
          <ul className="city-selector__list">
            {filteredCities.length === 0 ? (
              <li className="city-selector__empty">Міст не знайдено</li>
            ) : (
              filteredCities.map((city) => (
                <li key={city}>
                  <button
                    type="button"
                    onClick={() => handleSelect(city)}
                    className={`city-selector__option ${selectedCity === city ? "is-selected" : ""}`}
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
