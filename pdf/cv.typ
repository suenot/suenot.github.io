// CV for Eugen Soloviov, one PDF per site language. Content: src/data/cv/cv.<lang>.json,
// labels: src/data/cv/labels.json. Build all with: npm run resume
// (one file: typst compile --root . --font-path pdf/fonts --input lang=ru pdf/cv.typ out.pdf)
#let lang = sys.inputs.at("lang", default: "en")
#let cv = json("/src/data/cv/cv." + lang + ".json")
#let LAB = json("/src/data/cv/labels.json").at(lang)
#let L = LAB.sections
#let now = LAB.now
#let get(d, k, default: none) = if type(d) == dictionary and k in d and d.at(k) != none { d.at(k) } else { default }
#let has(d, k) = {
  let v = get(d, k)
  v != none and v != "" and v != ()
}
#let is-rtl = lang == "ar"
#let latin = lang in ("en", "ru")
#let body-font = (
  en: ("Source Serif 4",),
  ru: ("Source Serif 4",),
  zh: ("Source Serif 4", "Songti SC"),
  ja: ("Source Serif 4", "Hiragino Mincho ProN"),
  ko: ("Source Serif 4", "AppleMyungjo"),
  ar: ("Source Serif 4", "Geeza Pro"),
).at(lang)

#let ink = black
#let mx = 18mm
#let my = 15mm

#set document(title: "Eugen Soloviov — CV (" + lang + ")", author: get(cv, "name", default: "Eugen Soloviov"))
#set page(paper: "a4", margin: (x: mx, top: my, bottom: my))
#set text(font: body-font, size: 10pt, fill: ink, lang: lang, hyphenate: false, dir: if is-rtl { rtl } else { ltr })

// Linked text keeps the same look as body text; underline is the only cue.
#let lnk(url, body) = if url != none and url != "" { link(url, body) } else { body }
#let sc(body) = if latin { text(tracking: 0.08em, smallcaps(body)) } else { body }
#let loc(x) = x.replace("present", now)
#let years(e) = {
  let s = get(e, "start", default: "")
  let t = get(e, "end", default: "")
  let y = get(e, "years")
  if y != none { loc(y.replace(regex("(\\d)-(\\d|present)"), m => m.captures.at(0) + "–" + m.captures.at(1))) }
  else if s == "" { loc(t) } else if t == "" or t == s { s } else { s + "–" + loc(t) }
}
#let join(items, sep: ", ") = items.join(sep)

// k = spacing factor (1 = comfortable, lower = tighter). Font size never changes.
#let section(k, title) = {
  v(15pt * k, weak: true)
  block(sticky: true, below: 7pt * k, {
    text(size: 9.5pt, weight: "semibold", sc(title))
    v(-2pt)
    line(length: 100%, stroke: 0.4pt + ink)
  })
}

#let row(l, r) = [#l #h(1fr) #r]

#let body(k) = {
  set par(leading: 0.5em * k + 0.2em, spacing: 6pt * k, justify: false)
  show link: it => underline(offset: 1.5pt, stroke: 0.3pt, it)

  // Header
  align(center, {
    text(size: 25pt, tracking: 0.035em, weight: "regular", smallcaps(cv.name))
    v(-2pt * k)
    text(size: 11pt, style: "italic", cv.headline)
    v(3pt * k)
    let parts = ()
    if has(cv, "location") { parts.push(cv.location) }
    if has(cv, "email") { parts.push(link("mailto:" + cv.email, cv.email)) }
    for l in get(cv, "links", default: ()) { parts.push(lnk(get(l, "url"), get(l, "display", default: l.label))) }
    text(size: 9.5pt, parts.join([ · ]))
  })

  if has(cv, "summary") {
    v(9pt * k)
    cv.summary
  }

  // Capabilities
  if has(cv, "capabilities") {
    section(k, L.at("capabilities", default: "Capabilities"))
    set block(spacing: 10pt * k)
    for c in cv.capabilities {
      block(breakable: false, {
        strong(c.title)
        if has(c, "summary") [ — #c.summary]
        if has(c, "proof") [ #text(style: "italic")[#c.proof.join(" · ")]]
      })
    }
  }

  // Experience
  if has(cv, "experience") {
    section(k, L.experience)
    for (i, e) in cv.experience.enumerate() {
      block(breakable: false, above: if i == 0 { 0pt } else { 10pt * k }, below: 0pt, {
        row(
          [#strong(lnk(get(e, "url"), e.org)) #if has(e, "role") [ · #emph(e.role)]],
          text(size: 9.5pt, years(e)),
        )
        v(1pt)
        if has(e, "summary") { e.summary }
        if has(e, "bullets") {
          v(1pt * k)
          set list(marker: [–], body-indent: 5pt, indent: 4pt, spacing: 5pt * k)
          for b in e.bullets [- #b]
        }
        if has(e, "stack") {
          v(1pt * k)
          text(size: 9.5pt, style: "italic")[#L.stack: #e.stack.join(", ")]
        }
      })
    }
  }

  // Selected projects
  if has(cv, "projects") {
    section(k, L.projects)
    for (i, p) in cv.projects.enumerate() {
      block(breakable: false, above: if i == 0 { 0pt } else { 9pt * k }, below: 0pt, {
        grid(
          columns: (1fr, auto), column-gutter: 12pt,
          [#strong(lnk(get(p, "url"), p.name)) #if has(p, "summary") [ — #p.summary]],
          text(size: 9.5pt, loc(get(p, "years", default: "").replace(regex("(\\d)-(\\d|present)"), m => m.captures.at(0) + "–" + m.captures.at(1)))),
        )
        if has(p, "metric") or has(p, "stack") {
          v(1pt)
          text(size: 9.5pt, style: "italic", {
            let bits = ()
            if has(p, "metric") { bits.push(p.metric) }
            if has(p, "stack") { bits.push(p.stack.join(", ")) }
            bits.join([ · ])
          })
        }
      })
    }
  }

  // Video
  if has(cv, "video") {
    let v0 = cv.video
    section(k, "Video")
    block(breakable: false, {
      if has(v0, "summary") { v0.summary; linebreak() }
      if has(v0, "manual") [#strong[By hand.] #v0.manual.join(" · ")#linebreak()]
      if has(v0, "code") [#strong[In code.] #v0.code.join(" · ")]
    })
  }

  // Skills
  if has(cv, "skills") {
    section(k, L.skills)
    set block(spacing: 6pt * k)
    for s in cv.skills {
      block(breakable: false, [#strong(s.group): #s.items.join(", ")])
    }
  }

  if has(cv, "awards") {
    section(k, L.awards)
    set block(spacing: 5pt * k)
    for a in cv.awards {
      block(breakable: false, {
        if has(a, "date") [#a.date — ]
        strong(lnk(get(a, "url"), a.title))
        if has(a, "detail") [, #a.detail]
      })
    }
  }

  if has(cv, "education") {
    section(k, L.education)
    set block(spacing: 5pt * k)
    for e in cv.education {
      if type(e) == dictionary {
        block(breakable: false, grid(
          columns: (1fr, auto), column-gutter: 12pt,
          [#strong(get(e, "school", default: get(e, "org", default: ""))) #if has(e, "degree") [ · #emph(e.degree)]],
          text(size: 9.5pt, years(e)),
        ))
      } else { block(e) }
    }
  }

  if has(cv, "courses") {
    section(k, L.courses)
    set block(spacing: 4.5pt * k)
    for c in cv.courses {
      block(breakable: false, {
        if has(c, "date") [#c.date · ]
        lnk(get(c, "url"), c.title)
        if has(c, "org") [, #emph(c.org)]
      })
    }
  }

  if has(cv, "languages") {
    section(k, L.languages)
    cv.languages.map(l => if type(l) == dictionary {
      strong(get(l, "name", default: "")) + if has(l, "level") { [: #l.level] } else { [] }
    } else { l }).join([ · ])
  }
}

// Pick the loosest spacing at which content fits three pages.
#context {
  let w = page.width - 2 * mx
  let avail = 3 * (page.height - 2 * my) - 60pt
  let levels = (1.0, 0.9, 0.8, 0.7, 0.6)
  let chosen = levels.last()
  for k in levels {
    if measure(block(width: w, body(k))).height <= avail {
      chosen = k
      break
    }
  }
  body(chosen)
}
