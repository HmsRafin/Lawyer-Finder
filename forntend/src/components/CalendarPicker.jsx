import React, { useState } from 'react';

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const TIME_SLOTS = [
  '09:30:00',
  '10:30:00',
  '11:30:00',
  '13:00:00',
  '14:30:00',
  '16:00:00'
];

export default function CalendarPicker({ selectedDate, selectedTime, onSelect, takenSlots = [] }) {
  // Current calendar view month/year
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const handleDayClick = (day) => {
    const formattedDay = String(day).padStart(2, '0');
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
    onSelect(dateStr, selectedTime || TIME_SLOTS[0]);
  };

  const handleSlotClick = (slot) => {
    onSelect(selectedDate || getInitialDate(), slot);
  };

  const getInitialDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="bg-[#E9F0E7] p-4 sm:p-5 rounded-2xl border border-[#C1C9BC]/70 shadow-sm">
      {/* Month Selector */}
      <div className="flex items-center justify-between font-bold text-sm text-[#181D19] mb-3">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#E3EBE1] text-[#414942]"
        >
          <span className="material-symbols-rounded text-[20px]">chevron_left</span>
        </button>
        <span className="font-display font-bold">
          {MONTH_NAMES[currentMonth]} {currentYear}
        </span>
        <button
          type="button"
          onClick={handleNextMonth}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#E3EBE1] text-[#414942]"
        >
          <span className="material-symbols-rounded text-[20px]">chevron_right</span>
        </button>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="font-bold text-[#71796F] py-1 text-[11px] uppercase">
            {d}
          </div>
        ))}

        {/* Blank days before month starts */}
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div key={`blank-${i}`} className="p-1 opacity-20 pointer-events-none" />
        ))}

        {/* Days of current month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const formattedDay = String(day).padStart(2, '0');
          const formattedMonth = String(currentMonth + 1).padStart(2, '0');
          const thisDateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
          const isSelected = selectedDate === thisDateStr;

          // Check if past
          const dayDate = new Date(currentYear, currentMonth, day, 23, 59, 59);
          const isPast = dayDate < new Date();

          return (
            <button
              key={day}
              type="button"
              disabled={isPast}
              onClick={() => handleDayClick(day)}
              className={`py-1.5 rounded-lg font-semibold transition-all ${
                isSelected
                  ? 'bg-[#1B6E45] text-white shadow-e1 font-bold'
                  : isPast
                  ? 'text-[#71796F]/40 cursor-not-allowed'
                  : 'text-[#181D19] hover:bg-[#DDE5DB]'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Time Slots */}
      <div className="mt-4 pt-3 border-t border-[#C1C9BC]/60">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#414942] mb-2">
          Available Time Slots (24h format)
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {TIME_SLOTS.map(slot => {
            const isSelected = selectedTime === slot;
            const isTaken = takenSlots.includes(slot);
            const displayTime = slot.substring(0, 5);

            return (
              <button
                key={slot}
                type="button"
                disabled={isTaken}
                onClick={() => handleSlotClick(slot)}
                className={`py-2 px-1 text-xs rounded-xl font-semibold border transition-all text-center ${
                  isSelected
                    ? 'bg-[#1B6E45] text-white border-transparent shadow-e1 font-bold'
                    : isTaken
                    ? 'bg-gray-100 text-gray-400 line-through cursor-not-allowed border-gray-200'
                    : 'bg-white text-[#181D19] border-[#C1C9BC] hover:border-[#1B6E45] hover:bg-[#F5FAF5]'
                }`}
              >
                {displayTime}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
