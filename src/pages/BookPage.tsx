import { useState } from "react";
import { Link } from "react-router-dom";
import { BookingForm, type BookingDetails } from "../components/booking/BookingForm";
import "../components/booking/booking.css";
import { Field } from "../components/forms/FormFields";
import { AsyncContent } from "../components/ui/AsyncContent";
import { useAsyncData } from "../hooks/useAsyncData";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import {
  createConsultationBooking,
  listBookableTypes,
  listOpenSlots,
  type BookableType,
  type OpenSlot,
} from "../services/booking";

interface Confirmation {
  typeName: string;
  startsAt: string;
}

function todayInputValue() {
  return new Date().toLocaleDateString("en-CA");
}

function formatSlotDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

function formatSlotTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function BookPage() {
  useDocumentMeta({ title: "Book a Consultation" });

  const [selectedType, setSelectedType] = useState<BookableType | null>(null);
  const [date, setDate] = useState(todayInputValue);
  const [selectedSlot, setSelectedSlot] = useState<OpenSlot | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const types = useAsyncData(listBookableTypes, []);
  const slots = useAsyncData(
    () => (selectedType ? listOpenSlots(selectedType.id, date) : Promise.resolve([])),
    [selectedType?.id, date],
  );

  function chooseType(type: BookableType) {
    setSelectedType(type);
    setSelectedSlot(null);
  }

  async function handleBook(details: BookingDetails) {
    if (!selectedType || !selectedSlot) return;
    try {
      await createConsultationBooking({
        consultationTypeId: selectedType.id,
        startsAt: selectedSlot.starts_at,
        clientName: details.name,
        clientEmail: details.email,
        clientNotes: details.notes || null,
      });
    } catch (err) {
      slots.reload();
      throw err;
    }
    setConfirmation({ typeName: selectedType.name, startsAt: selectedSlot.starts_at });
  }

  function bookAnother() {
    setConfirmation(null);
    setSelectedSlot(null);
    setSelectedType(null);
  }

  if (confirmation) {
    return (
      <div className="page-narrow">
        <Link to="/" className="back-link">
          Back to portfolio
        </Link>
        <div className="form-success" role="status">
          <h1 className="form-success__title">Booking request received</h1>
          <p>
            {confirmation.typeName} on {formatSlotDate(confirmation.startsAt)} at {formatSlotTime(confirmation.startsAt)}.
            Your request is pending until it is confirmed; you will hear back at the email address you provided.
          </p>
          <button type="button" className="btn btn--ghost" onClick={bookAnother}>
            Book another time
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-narrow">
      <Link to="/" className="back-link">
        Back to portfolio
      </Link>
      <p className="mono-label">Consultation</p>
      <h1 className="page-title">Book a consultation</h1>
      <p className="entry__text">
        Choose a session, pick an open time, and send your details. Times are shown in your local time zone.
      </p>

      <section className="booking-step" aria-labelledby="booking-step-type">
        <h2 id="booking-step-type" className="mono-label">
          1. Choose a session
        </h2>
        <AsyncContent
          state={types}
          isEmpty={(list) => list.length === 0}
          emptyMessage="No consultations are open for booking right now."
        >
          {(list) => (
            <ul className="booking-types">
              {list.map((type) => (
                <li key={type.id}>
                  <button
                    type="button"
                    className="booking-type"
                    aria-pressed={selectedType?.id === type.id}
                    onClick={() => chooseType(type)}
                  >
                    <span className="booking-type__name">{type.name}</span>
                    <span className="entry__muted">
                      {type.duration_minutes} min
                      {type.price_amount !== null && ` · ${type.price_amount.toFixed(2)} ${type.currency ?? ""}`}
                    </span>
                    {type.description && <span className="entry__text">{type.description}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </AsyncContent>
      </section>

      {selectedType && (
        <section className="booking-step" aria-labelledby="booking-step-time">
          <h2 id="booking-step-time" className="mono-label">
            2. Pick an open time
          </h2>
          <Field id="booking-date" label="Date">
            <input
              id="booking-date"
              type="date"
              className="input"
              min={todayInputValue()}
              value={date}
              onChange={(event) => {
                setDate(event.target.value);
                setSelectedSlot(null);
              }}
            />
          </Field>
          <AsyncContent
            state={slots}
            isEmpty={(list) => list.length === 0}
            emptyMessage="No open times on this day. Try another date."
          >
            {(list) => (
              <ul className="booking-slots">
                {list.map((slot) => (
                  <li key={slot.starts_at}>
                    <button
                      type="button"
                      className="booking-slot"
                      aria-pressed={selectedSlot?.starts_at === slot.starts_at}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      {formatSlotTime(slot.starts_at)}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </AsyncContent>
        </section>
      )}

      {selectedType && selectedSlot && (
        <section className="booking-step" aria-labelledby="booking-step-details">
          <h2 id="booking-step-details" className="mono-label">
            3. Your details
          </h2>
          <p className="entry__text">
            {selectedType.name} on {formatSlotDate(selectedSlot.starts_at)} at {formatSlotTime(selectedSlot.starts_at)}
          </p>
          <BookingForm onSubmit={handleBook} />
        </section>
      )}
    </div>
  );
}
