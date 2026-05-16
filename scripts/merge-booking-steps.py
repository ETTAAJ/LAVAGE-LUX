# -*- coding: utf-8 -*-
from pathlib import Path

INDEX = Path(__file__).resolve().parents[1] / "public" / "index.html"
html = INDEX.read_text(encoding="utf-8")

DATE_BLOCK = """                <div>
                  <label class="booking-label" for="bookingDate">Date</label>
                  <input id="bookingDate" name="date" type="date" required class="booking-input">
                  <p class="booking-field-error mt-1 hidden" data-error-for="date">Veuillez choisir une date</p>
                </div>
                <div>
                  <span class="booking-label">Créneau horaire</span>
                  <div class="booking-slots mt-2" id="bookingSlots" role="radiogroup" aria-label="Créneau horaire">
                    <label class="booking-slot"><input type="radio" name="slot" value="09:00" class="sr-only" required><span>09:00</span></label>
                    <label class="booking-slot"><input type="radio" name="slot" value="10:00" class="sr-only"><span>10:00</span></label>
                    <label class="booking-slot"><input type="radio" name="slot" value="11:00" class="sr-only"><span>11:00</span></label>
                    <label class="booking-slot"><input type="radio" name="slot" value="12:00" class="sr-only"><span>12:00</span></label>
                    <label class="booking-slot"><input type="radio" name="slot" value="14:00" class="sr-only"><span>14:00</span></label>
                    <label class="booking-slot"><input type="radio" name="slot" value="15:00" class="sr-only"><span>15:00</span></label>
                    <label class="booking-slot"><input type="radio" name="slot" value="16:00" class="sr-only"><span>16:00</span></label>
                    <label class="booking-slot"><input type="radio" name="slot" value="17:00" class="sr-only"><span>17:00</span></label>
                    <label class="booking-slot"><input type="radio" name="slot" value="18:00" class="sr-only"><span>18:00</span></label>
                    <label class="booking-slot"><input type="radio" name="slot" value="19:00" class="sr-only"><span>19:00</span></label>
                    <label class="booking-slot"><input type="radio" name="slot" value="20:00" class="sr-only"><span>20:00</span></label>
                  </div>
                  <p class="booking-field-error mt-2 hidden" data-error-for="slot">Veuillez choisir un créneau</p>
                </div>
"""

DATE_BLOCK = DATE_BLOCK.replace("<motion div>", "<div>").replace("</motion div>", "</motion div>")

STEP4_OLD_START = '            <fieldset class="booking-step" data-booking-step="4" hidden>\n              <legend class="booking-step__legend">\n                <h2 class="booking-step__title">Quand êtes-vous disponible ?</h2>'

STEP6_END = '            </fieldset>\n          </form>'

STEP4_NEW = """            <fieldset class="booking-step" data-booking-step="4" hidden>
              <legend class="booking-step__legend">
                <h2 class="booking-step__title">Confirmation</h2>
                <p class="booking-step__subtitle">Coordonnées et récapitulatif</p>
              </legend>
              <div class="mt-5 space-y-4">
                <div>
                  <label class="booking-label" for="bookingName">Nom complet</label>
                  <input id="bookingName" name="name" type="text" required autocomplete="name" placeholder="Votre nom" class="booking-input">
                  <p class="booking-field-error mt-1 hidden" data-error-for="name">Veuillez entrer votre nom</p>
                </div>
                <div>
                  <label class="booking-label" for="bookingPhone">Téléphone</label>
                  <input id="bookingPhone" name="phone" type="tel" required autocomplete="tel" placeholder="06 12 34 56 78" class="booking-input">
                  <p class="booking-field-error mt-1 hidden" data-error-for="phone">Entrez un numéro valide</p>
                </div>
                <div>
                  <label class="booking-label" for="bookingNote">Note <span class="booking-label-optional">(optionnel)</span></label>
                  <textarea id="bookingNote" name="note" rows="2" placeholder="Code portail, instructions d&apos;accès…" class="booking-input"></textarea>
                </div>
              </div>
              <div id="bookingRecap" class="booking-recap mt-4" aria-live="polite"></div>
              <p class="booking-recap-note text-center">Aucun paiement en ligne · Confirmation WhatsApp</p>
              <div class="booking-nav">
                <button type="button" class="booking-btn booking-btn--back" data-booking-prev aria-label="Retour">←</button>
                <button type="button" class="booking-btn booking-btn--primary booking-btn--confirm" id="bookingConfirm">Confirmer la réservation ✓</button>
              </div>
            </fieldset>
          </form>"""

marker = '                  <p class="booking-field-error mt-1 hidden" data-error-for="quartier">Veuillez choisir un quartier</p>\n                </div>\n              </div>\n              <div class="booking-nav">'
insert = '                  <p class="booking-field-error mt-1 hidden" data-error-for="quartier">Veuillez choisir un quartier</p>\n                </div>\n' + DATE_BLOCK + '              </div>\n              <div class="booking-nav">'

if marker not in html:
    raise SystemExit("insert marker not found")
html = html.replace(marker, insert, 1)

start = html.find(STEP4_OLD_START)
end = html.find(STEP6_END)
if start == -1 or end == -1:
    raise SystemExit(f"range not found start={start} end={end}")
html = html[:start] + STEP4_NEW + html[end + len(STEP6_END):]

INDEX.write_text(html, encoding="utf-8")
print("merged to 4 steps")
