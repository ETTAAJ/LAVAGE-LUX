# -*- coding: utf-8 -*-
from pathlib import Path

INDEX = Path(__file__).resolve().parents[1] / "public" / "index.html"

START = '    <section id="contact" class="border-t border-white/10 bg-panel">'
END = '    <section id="prestations"'

NEW = """    <section id="contact" class="border-t border-white/10 bg-panel">
      <div class="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <p class="text-[10px] uppercase tracking-[0.35em] text-or">Contact</p>
        <h2 class="mt-2 font-title text-3xl font-bold">Besoin d&apos;aide ?</h2>
        <p class="mt-4 text-sm text-white/65">Utilisez le formulaire en haut de page ou appelez-nous.</p>
        <a href="#reservation" class="cta-reserver mt-6 inline-flex items-center justify-center rounded-full bg-or px-8 py-3.5 text-xs font-bold uppercase tracking-[0.18em] text-black transition hover:bg-yellow-300">Formulaire de réservation</a>
        <div class="mt-8 space-y-3 text-sm">
          <p><span class="text-white/50">Téléphone :</span> <a href="tel:+212702430945" class="font-semibold text-or">+212 7 02 43 09 45</a></p>
          <p><span class="text-white/50">Localisation :</span> <a href="https://maps.app.goo.gl/Sco2HPLv1bY7BGn69" class="font-semibold text-or hover:underline" target="_blank" rel="noopener noreferrer">Lavage Luxe Marrakech sur Google Maps</a></p>
        </div>
      </div>
    </section>

"""

html = INDEX.read_text(encoding="utf-8")
start = html.find(START)
end = html.find(END)
if start == -1 or end == -1:
    raise SystemExit("markers not found")
html = html[:start] + NEW + html[end:]
INDEX.write_text(html, encoding="utf-8")
print("patched contact")
