
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  BookingForm,
  type BookingDetails,
} from "../components/booking/BookingForm";
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
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function formatSlotTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function BookPage() {
  useDocumentMeta({
    title: "Book a Consultation",
    description:
      "Choose a consultation session and book a convenient time.",
  });

  const [selectedType, setSelectedType] =
    useState<BookableType | null>(null);

  const [date, setDate] = useState(todayInputValue);
  const [selectedSlot, setSelectedSlot] =
    useState<OpenSlot | null>(null);

  const [confirmation, setConfirmation] =
    useState<Confirmation | null>(null);

  const types = useAsyncData(listBookableTypes, []);

  const slots = useAsyncData(
    () =>
      selectedType
        ? listOpenSlots(selectedType.id, date)
        : Promise.resolve([]),
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

    setConfirmation({
      typeName: selectedType.name,
      startsAt: selectedSlot.starts_at,
    });
  }

  function bookAnother() {
    setConfirmation(null);
    setSelectedSlot(null);
    setSelectedType(null);
  }

  if (confirmation) {
    return (
      <div className="book-page">
        <Link to="/" className="book-page__back">
          <span aria-hidden="true">←</span>
          <span>Back to portfolio</span>
        </Link>

        <div className="book-page__confirmation" role="status">
          <p className="book-page__eyebrow">
            BOOKING REQUEST
          </p>

          <h1>Thank you for reaching out.</h1>

          <p className="book-page__confirmation-intro">
            Your booking request has been received.
          </p>

          <div className="book-page__confirmation-details">
            <p>{confirmation.typeName}</p>
            <p>{formatSlotDate(confirmation.startsAt)}</p>
            <p>{formatSlotTime(confirmation.startsAt)}</p>
          </div>

          <p className="book-page__note">
            Your request is pending until it is confirmed.
            You will hear back at the email address you provided.
          </p>

          <button
            type="button"
            className="book-page__reset"
            onClick={bookAnother}
          >
            Book another session <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="book-page">
      <Link to="/" className="book-page__back">
        <span aria-hidden="true">←</span>
        <span>Back to portfolio</span>
      </Link>

      <header className="book-page__header">
        <p className="book-page__eyebrow">
          CONSULTATION / BOOKING
        </p>

        <h1 className="book-page__title">
          Let's have a conversation.
        </h1>

        <p className="book-page__intro">
          Choose the type of session that suits your needs,
          select an available time, and send your booking request.
        </p>

        <p className="book-page__timezone">
          All available times are displayed in your local time zone.
        </p>
      </header>

      <div className="book-page__steps">
        <section
          className="booking-step"
          aria-labelledby="booking-step-type"
        >
          <div className="booking-step__heading">
            <span className="booking-step__number">01</span>
            <div>
              <h2 id="booking-step-type">
                Choose a session
              </h2>
              <p>Select the consultation that best fits your needs.</p>
            </div>
          </div>

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
                      <span className="booking-type__top">
                        <span className="booking-type__name">
                          {type.name}
                        </span>
                        <span
                          className="booking-type__indicator"
                          aria-hidden="true"
                        />
                      </span>

                      <span className="booking-type__meta">
                        {type.duration_minutes} minutes
                        {type.price_amount !== null &&
                          ` · ${type.price_amount.toFixed(2)} ${type.currency ?? ""}`}
                      </span>

                      {type.description && (
                        <span className="booking-type__description">
                          {type.description}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </AsyncContent>
        </section>

        {selectedType && (
          <section
            className="booking-step"
            aria-labelledby="booking-step-time"
          >
            <div className="booking-step__heading">
              <span className="booking-step__number">02</span>
              <div>
                <h2 id="booking-step-time">
                  Choose a date and time
                </h2>
                <p>
                  Select a date to see the available sessions.
                </p>
              </div>
            </div>

            <div className="book-page__date">
              <Field id="booking-date" label="Select a date">
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
            </div>

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
                        aria-pressed={
                          selectedSlot?.starts_at === slot.starts_at
                        }
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
          <section
            className="booking-step"
            aria-labelledby="booking-step-details"
          >
            <div className="booking-step__heading">
              <span className="booking-step__number">03</span>
              <div>
                <h2 id="booking-step-details">
                  Your details
                </h2>
                <p>
                  Review your selected session and provide your details.
                </p>
              </div>
            </div>

            <div className="book-page__selection">
              <p>{selectedType.name}</p>
              <p>
                {formatSlotDate(selectedSlot.starts_at)} at{" "}
                {formatSlotTime(selectedSlot.starts_at)}
              </p>
            </div>

            <BookingForm onSubmit={handleBook} />
          </section>
        )}
      </div>
    </div>
  );
}
