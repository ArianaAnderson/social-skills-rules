#!/usr/bin/env python3
"""Build the /guides/ parent articles for books.familygallerytv.com.

Each guide is a static page with Article and Breadcrumb structured data,
internal links to related guides, and a link to the matching book on Amazon.
Run from the repository root: python3 automation/build-guides.py
"""
import html, json, os, datetime, re

SITE = "https://books.familygallerytv.com"
AUTHOR = "Arianna Andersen, Ph.D."
TODAY = datetime.date.today().isoformat()

BOOKS = {
    "bootcamp": ("Social Skills Boot Camp workbook", "https://www.amazon.com/dp/B0HNTRT4DF",
                 "Illustrated situations, role-play prompts, and an answer guide for ages four to ten."),
    "pizza": ("Not Everyone Likes Pizza", "https://www.amazon.com/dp/B0HN8TX1Z5",
              "A picture book about not being invited and choosing friends who choose you."),
    "directions": ("Don't Let the Directions Trick You!", "https://www.amazon.com/dp/B0HPMHGNZH",
                   "73 following-directions activities for ages 8 to 12, with answer keys."),
}

GUIDES = [
 dict(slug="teach-kids-conversation-skills",
  title="How to Teach Kids Conversation Skills: Return the Turn",
  desc="A simple way to teach children back-and-forth conversation: respond to what was said, ask a related question, and listen. Includes scripts and a 5-minute practice game.",
  book="bootcamp",
  body=[
   ("p","Some children love to talk but have trouble with the back-and-forth part of conversation. They may launch into a favorite topic, answer a question with one word, or switch subjects before a friend has finished. Other children want to talk but freeze because they do not know what to say next. In both cases the missing piece is the same. A conversation is an exchange, and each person needs a turn."),
   ("h2","The two-part formula: related response plus quick question"),
   ("p","Give your child one pattern they can remember. When a friend says something, your child gives a related response and then asks a quick question. That is it."),
   ("ul",["Friend: \"I went to the lake this weekend.\"","Related response: \"That sounds fun. I like swimming.\"","Quick question: \"Did you go in the water?\""]),
   ("p","The related response shows that your child heard the friend. The question hands the turn back. Then your child waits and listens to the answer before adding anything new."),
   ("h2","Why \"just ask questions\" is not enough"),
   ("p","A child who only asks questions can sound like an interviewer. A child who only shares can sound like they are giving a speech. The formula keeps both children in the conversation. It also gives a child a way to stay on the friend's topic for at least one turn, which is often the hardest step."),
   ("h2","A 5-minute practice game at home"),
   ("ol",["Sit across from your child and say one simple sentence about your day.","Your child gives a related response and one quick question.","Answer the question, then switch roles.","Play three to five rounds. Stop while it is still fun.","Point out one specific thing they did well, such as \"You asked about my lunch, not about your game. That kept us talking.\""]),
   ("p","Keep the topics light at first: food, pets, weekend plans, a show you both watched. Once the pattern feels easy, try topics your child finds less interesting. That is where the skill really gets practiced."),
   ("h2","Common sticking points"),
   ("ul",["<strong>Topic jumping.</strong> If your child switches to their own interest, pause and ask, \"What did I just tell you about?\" Then let them try the related response again.","<strong>One-word answers.</strong> Teach \"answer plus one more thing.\" For example: \"Yes. We had pizza.\"","<strong>Interrupting.</strong> Practice waiting until the other person's sentence is completely finished. A silent count of one or two helps some children."]),
   ("h2","Adapt it to your child"),
   ("p","Some children communicate with fewer words, use a device, or need extra processing time. The goal is not a perfect script. The goal is noticing the other person and giving them a turn. Adjust pace, language, and expectations so the practice feels doable."),
   ("p","The <em>Social Skills Boot Camp</em> workbook includes illustrated conversation scenes and role-play prompts that use this same approach, so you can keep practicing after the first few rounds."),
  ],
  faq=[("What age can children start practicing conversation turns?","Many children can practice a simple related response and question by preschool or early elementary age with adult modeling. Adjust the length and topics to the child."),
       ("How long should a practice session last?","Five minutes is plenty. Short, frequent practice usually works better than one long session.")]),

 dict(slug="child-not-invited-to-party",
  title="What to Do When Your Child Isn't Invited to a Party",
  desc="How to help a child who was left out of a birthday party or playdate: what to say, what to avoid, and how to steer toward friendships that go both ways.",
  book="pizza",
  body=[
   ("p","Finding out that classmates went to a party without them can hurt a child deeply. It can hurt parents too. The first instinct is often to fix it right away by calling another parent or promising a bigger party. A calmer first step usually helps more."),
   ("h2","Start by listening"),
   ("p","Let your child tell you what happened in their own words. Name the feeling without rushing past it: \"You felt left out, and that is really hard.\" Avoid jumping straight to \"They were not real friends anyway.\" Your child may still like those children and want to be included."),
   ("h2","Separate the facts from the story"),
   ("p","Children often decide that being left out means nobody likes them. Gently help them sort what they know from what they are guessing."),
   ("ul",["Maybe the party had a small guest limit.","Maybe the families know each other outside school.","Maybe the other child chose friends from a different activity.","Maybe there is a friendship habit worth practicing."]),
   ("p","Not every invitation is personal. Not every friendship will go both ways, either. Both can be true."),
   ("h2","Look for friends who choose you back"),
   ("p","One of the most useful lessons is noticing who is already kind and interested. Ask your child: \"Who sat with you this week? Who laughs at your jokes? Who asked you to play?\" Those children are good candidates for a playdate. Putting effort into friendships that go both ways is a healthier goal than chasing one child who keeps saying no."),
   ("h2","Check for a habit to practice"),
   ("p","Sometimes a pattern pushes peers away. A child might take over games, ignore turns in conversation, or insist on their own way. If you notice something like that, pick one specific habit and practice it at home in a low-pressure way. Keep the tone encouraging. The message is \"Here is a skill we can practice,\" not \"This is why you were left out.\""),
   ("h2","What to avoid"),
   ("ul",["Do not contact the host family to complain about the invitation list.","Do not promise your child that everyone will be friends.","Do not post about the party or talk about it in front of other families."]),
   ("p","The picture book <em>Not Everyone Likes Pizza</em> follows Riley through being left out and choosing friends who choose her back. Reading it together gives you a natural way to start this conversation without putting your child on the spot."),
  ],
  faq=[("Should I call the other parent?","Usually not about the invitation itself. If there is a pattern of exclusion or unkind behavior at school, talk with the teacher instead."),
       ("How can I help my child make new friends?","Invite one child who already shows interest for a short, structured playdate with a planned activity.")]),

 dict(slug="teaching-personal-space-to-kids",
  title="Teaching Personal Space to Kids Without Shaming Them",
  desc="Practical ways to teach children about personal space: what to say, simple practice games, and how to handle different comfort levels.",
  book="bootcamp",
  body=[
   ("p","Children who stand too close are rarely trying to be rude. Often they are excited, focused on what they want to say, or simply not noticing the other person's body language. Teaching personal space works best when it is treated as a skill to practice, not a character flaw."),
   ("h2","Use one concrete action"),
   ("p","\"Respect personal space\" is abstract. Give your child something they can do: \"Step back and leave comfortable room.\" Some families use the idea of an arm's length as a starting point. Explain that different people need different amounts of room, and the goal is to notice and respond."),
   ("h2","Teach the clues"),
   ("p","Help your child spot signs that someone wants more space:"),
   ("ul",["The other person leans back or steps away.","They turn their body to the side.","They stop talking or look uncomfortable.","They say \"Can you move back?\""]),
   ("p","When your child notices one of these, the response is simple. Step back, and respect the extra space without arguing about it."),
   ("h2","Practice games"),
   ("ol",["<strong>Comfortable room check.</strong> Stand far apart and have your child walk toward you slowly. Say \"stop\" when it feels comfortable. Switch roles so they can choose too.","<strong>Spot the clue.</strong> Act out a short conversation and lean back partway through. Your child earns a point for noticing and stepping back.","<strong>Ask first.</strong> Practice asking before a hug or touch: \"Can I give you a hug?\" Then practice accepting \"no\" calmly. A wave or a high five can be enough."]),
   ("h2","Keep objects away from faces"),
   ("p","Excited sharing often means a toy or drawing held right in front of someone's face. Rehearse a better sequence. Hold it at a comfortable distance, ask if they want to see it, and wait for the answer."),
   ("h2","Respond, do not lecture"),
   ("p","In the moment, a quiet reminder works better than a long explanation in front of peers. Agree on a private cue, such as a hand signal, that means \"give some room.\" Talk it through later when everyone is calm."),
   ("p","The <em>Social Skills Boot Camp</em> workbook includes illustrated personal space scenarios and role-play practice for ages four to ten."),
  ],
  faq=[("Is there one correct distance?","No. Comfort levels differ by person, family, and culture. Teach children to notice and respect the other person's response."),
       ("What if my child seeks a lot of physical contact?","Offer acceptable alternatives, such as a high five with permission, and practice asking first.")]),

 dict(slug="help-child-join-a-game",
  title="How to Help a Child Join a Game at Recess",
  desc="A step-by-step way to teach kids how to join a group game: watch, wait for an opening, ask, and learn the rules. Includes practice ideas for home.",
  book="bootcamp",
  body=[
   ("p","Joining a game that is already happening is one of the hardest social moves for many children. Some hang back and never ask. Others run straight in and change the rules. Both children want to play. They just need a clearer plan."),
   ("h2","The four-step plan"),
   ("ol",["<strong>Watch.</strong> Spend a minute noticing what the game is and how it is played.","<strong>Wait for an opening.</strong> Look for a natural break, like the end of a round.","<strong>Ask.</strong> \"Can I play?\" or \"Can I be on a team next round?\"","<strong>Follow their rules.</strong> If invited, play the game the way the group is already playing it."]),
   ("h2","Why watching matters"),
   ("p","Watching first tells a child what the game is, who is leading it, and when a good moment to ask might come. It also shows the group that the child is interested in their game, not trying to take it over."),
   ("h2","What if they say no?"),
   ("p","Rehearse this part too. A calm response keeps the door open: \"Okay, maybe next time.\" Then your child can look for another group or a different activity. Pushing, arguing, or joining anyway usually makes the next \"no\" more likely."),
   ("h2","Practice at home"),
   ("ul",["Start a simple game with a sibling or parent and have your child practice the four steps to join.","Role-play both a \"yes\" and a \"no\" so neither answer is a surprise.","Talk about which groups at school seem welcoming and which games your child already knows."]),
   ("h2","Help from school"),
   ("p","If your child keeps getting stuck, ask the teacher or recess staff which games are popular and whether there are structured activities your child could join. Knowing the rules in advance makes asking much easier."),
   ("p","The <em>Social Skills Boot Camp</em> workbook has illustrated joining-in scenes with questions you can talk through together."),
  ],
  faq=[("What should my child say to join?","A short, friendly question works best: \"Can I play?\" or \"Can I join next round?\""),
       ("My child joins but then takes over. What helps?","Practice the fourth step: following the group's rules. Praise specific moments when your child goes along with someone else's idea.")]),

 dict(slug="teaching-kids-to-accept-no",
  title="Teaching Kids to Accept No From Friends",
  desc="How to help children accept \"no\" from friends without arguing or wearing them down. Scripts, practice ideas, and why respecting no builds better friendships.",
  book="bootcamp",
  body=[
   ("p","Every child hears \"no\" from friends. No, I do not want to play that. No, I do not want to hear the rest of your story. No, I do not want to trade. How a child responds can make the difference between a friendship that grows and one that fades."),
   ("h2","Why accepting no matters"),
   ("p","When a child keeps asking, argues, or tries to wear a friend down, the friend learns that saying no is exhausting. Over time they may avoid the child altogether. Accepting \"no\" calmly tells friends their choices are safe with you. It is one of the most respectful things a child can learn."),
   ("h2","A simple script"),
   ("ul",["Friend: \"I don't want to play tag.\"","Your child: \"Okay. Do you want to do something else?\"","If the answer is still no: \"Okay, maybe later.\""]),
   ("p","Then your child moves on: another activity, another friend, or a different time."),
   ("h2","Practice at home"),
   ("ol",["Take turns making small requests and saying \"no\" kindly.","Practice the calm response out loud, including the tone of voice.","Celebrate when your child accepts a real \"no\" from you or a sibling without arguing."]),
   ("h2","When no is not okay"),
   ("p","Make the boundary clear. Accepting a friend's \"no\" to a game is different from accepting unkind treatment. If someone is threatening, bullying, or putting your child in danger, your child should tell a trusted adult right away."),
   ("h2","Offer choices, not pressure"),
   ("p","Some children push because they really want a particular game. Teach them to offer two choices and take turns choosing. \"We could play tag or build with blocks. You pick this time, and I will pick next time.\" That turns a standoff into shared decision-making."),
   ("p","The <em>Social Skills Boot Camp</em> workbook includes scenarios on respecting \"no\" and taking turns choosing, with an answer guide for adults."),
  ],
  faq=[("My child melts down when told no. Where do I start?","Start with low-stakes practice when your child is calm, and keep it short. Praise even partial success."),
       ("Is it okay to ask again later?","Yes. Asking once more at a different time is reasonable. Asking repeatedly in a row is pressure.")]),

 dict(slug="following-directions-activities-ages-8-12",
  title="Following Directions Activities for Kids Ages 8 to 12",
  desc="Why bright kids miss what a question asks, plus a four-step routine (read, mark and count, do, check) and practice ideas for careless mistakes.",
  book="directions",
  body=[
   ("p","Many capable children lose points not because they cannot do the work, but because they do not do what the question asked. They see a familiar-looking problem, race ahead, and miss the word \"not,\" the second part of the instructions, or the request to show their work."),
   ("h2","Why careless mistakes happen"),
   ("p","Fast readers often skim. When a task looks like one they have seen before, they answer the question they expect instead of the one in front of them. Extra details, changing instructions, and multi-step tasks catch them out. This is a habit, and habits can be practiced."),
   ("h2","A four-step routine: read, mark and count, do, check"),
   ("ol",["<strong>Read</strong> the whole task before starting.","<strong>Mark and count</strong> each thing you are asked to do. Circle key words and number the steps.","<strong>Do</strong> the work, one step at a time.","<strong>Check</strong> that every part was done. Count the steps again."]),
   ("h2","Quick practice ideas"),
   ("ul",["Write a three-step instruction for a simple task and hide a twist in step three.","Give a math word problem with an extra detail that is not needed, and ask your child which detail to ignore.","Ask your child to underline the exact question in a reading passage before answering it."]),
   ("h2","Make it a game, not a punishment"),
   ("p","Children respond better when tricky directions feel like a puzzle to solve. Celebrate when your child catches the trick. Keep the academic content easy so the focus stays on careful reading, not on hard math."),
   ("h2","When to talk to the school"),
   ("p","If your child struggles with directions across many settings, or the problem seems linked to attention or reading difficulties, talk with the teacher or your child's doctor. Practice can help with habits, but it is not a substitute for an evaluation when one is needed."),
   ("p","<em>Don't Let the Directions Trick You!</em> has 73 activities built around this routine, including tricky math word problems, sneaky grammar challenges, and reading stories, with answer keys."),
  ],
  faq=[("How often should my child practice?","One activity a day for a few minutes is enough to build the habit."),
       ("Does this work in a classroom?","Yes. The routine works at home, in class, or with a tutor.")]),

 dict(slug="family-art-night-conversation-game",
  title="A Family Art Night Game That Builds Conversation Skills",
  desc="Use famous paintings to practice turn-taking, listening, and accepting different opinions. A simple screen-light family activity for kids.",
  book="bootcamp",
  body=[
   ("p","Looking at art together is an easy way to practice conversation skills without anyone feeling put on the spot. There is no wrong answer about a painting. That makes it a safe place to practice listening, taking turns, and respecting different opinions."),
   ("h2","How to play"),
   ("ol",["Choose one painting. A book, a museum website, or a family art display on your TV all work.","Each person says one thing they notice.","The next person gives a related response before adding their own idea: \"I noticed the boat too. I also see a bird.\"","Ask one question to the next person: \"What do you think the person is feeling?\"","Take turns until everyone has had at least two turns."]),
   ("h2","Skills it practices"),
   ("ul",["<strong>Return the turn.</strong> Respond to what someone said before switching topics.","<strong>Don't yuck someone's yum.</strong> If you do not like the painting, say so kindly and ask what they like about it.","<strong>Listen to the whole answer.</strong> Wait until the speaker is completely finished."]),
   ("h2","Good paintings to start with"),
   ("p","Pick works with lots to notice: busy scenes, animals, weather, or people doing everyday things. Landscapes by Bierstadt, harbor scenes by Monet, and everyday interiors by Vermeer all give children plenty to talk about."),
   ("p","For more question ideas, see the <a href=\"https://familygallerytv.com/blog/family-art-night-five-questions/\">five questions for family art night</a> from The Family Gallery. They also make an art collection that plays on the TV you already own, with no subscription."),
   ("p","The <em>Social Skills Boot Camp</em> workbook covers the same conversation habits with illustrated practice scenes."),
  ],
  faq=[("What age is this for?","Preschoolers can name what they see. Older children can talk about feelings, stories, and opinions."),
       ("Do we need a museum?","No. Any picture book, printed image, or art shown on a TV works.")]),
]

CSS = ("body{margin:0;background:#fffaf0;color:#123846;font:1.05rem/1.75 system-ui,sans-serif}"
       "main{max-width:760px;margin:auto;padding:40px 24px 90px}h1{font-size:clamp(1.8rem,4vw,2.5rem);line-height:1.15;margin:.4em 0}"
       "h2{font-size:1.3rem;margin-top:1.8em}a{color:#075c60}.crumbs{font-size:.92rem}.meta{color:#4b6470;font-size:.95rem}"
       ".book{border:2px solid #075c60;border-radius:8px;padding:18px 20px;margin:2em 0;background:#fff}"
       ".book a.button{display:inline-block;margin-top:8px;padding:10px 16px;border-radius:5px;background:#075c60;color:#fff;text-decoration:none}"
       ".related li{margin:.3em 0}footer{border-top:1px solid #d9d2c2;margin-top:3em;padding-top:1em;font-size:.92rem}"
       ".cards{list-style:none;padding:0}.cards li{background:#fff;border:1px solid #d9d2c2;border-radius:8px;padding:16px 18px;margin:14px 0}"
       ".cards a{font-weight:600;font-size:1.1rem}")

def render_block(kind, val):
    if kind == "p": return f"<p>{val}</p>"
    if kind == "h2": return f"<h2>{html.escape(val)}</h2>"
    if kind in ("ul", "ol"): return f"<{kind}>" + "".join(f"<li>{v}</li>" for v in val) + f"</{kind}>"
    raise ValueError(kind)

def head(title, desc, url, extra=""):
    return (f"<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">"
            f"<title>{html.escape(title)} | Social Skills Rules</title><meta name=\"description\" content=\"{html.escape(desc)}\">"
            f"<link rel=\"canonical\" href=\"{url}\"><meta property=\"og:title\" content=\"{html.escape(title)}\">"
            f"<meta property=\"og:description\" content=\"{html.escape(desc)}\"><meta property=\"og:url\" content=\"{url}\">"
            f"<meta property=\"og:type\" content=\"article\"><meta property=\"og:image\" content=\"{SITE}/assets/social-card.jpg\">"
            f"<style>{CSS}</style>{extra}</head><body><main>")

FOOT = ("<footer><strong>Social Skills Rules</strong>. Books by Arianna Andersen, Ph.D. "
        "<a href=\"/\">See all books</a> · <a href=\"/guides/\">Parent guides</a> · <a href=\"/privacy/\">Privacy</a> · "
        "<a href=\"https://familygallerytv.com/\">Family Gallery TV</a><br>These guides are general parenting resources, not medical or diagnostic advice.</footer>"
        "</main><script defer src=\"/analytics/visitor-analytics.js\" data-ga-id=\"G-XFWTQDGNEV\"></script></body></html>")

def build():
    os.makedirs("guides", exist_ok=True)
    for g in GUIDES:
        url = f"{SITE}/guides/{g['slug']}/"
        bname, blink, bdesc = BOOKS[g["book"]]
        ld = [{"@context": "https://schema.org", "@type": "Article", "headline": g["title"], "description": g["desc"],
               "author": {"@type": "Person", "name": AUTHOR}, "publisher": {"@type": "Organization", "name": "Social Skills Rules", "url": SITE + "/"},
               "datePublished": TODAY, "dateModified": TODAY, "mainEntityOfPage": url, "image": SITE + "/assets/social-card.jpg"},
              {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
                  {"@type": "ListItem", "position": 1, "name": "Social Skills Rules", "item": SITE + "/"},
                  {"@type": "ListItem", "position": 2, "name": "Parent guides", "item": SITE + "/guides/"},
                  {"@type": "ListItem", "position": 3, "name": g["title"], "item": url}]},
              {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
                  {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in g["faq"]]}]
        extra = "".join(f"<script type=\"application/ld+json\">{json.dumps(x, ensure_ascii=False)}</script>" for x in ld)
        out = [head(g["title"], g["desc"], url, extra),
               "<div class=\"crumbs\"><a href=\"/\">Social Skills Rules</a> › <a href=\"/guides/\">Parent guides</a></div>",
               f"<h1>{html.escape(g['title'])}</h1><p class=\"meta\">By {AUTHOR} · Updated {TODAY}</p>"]
        out += [render_block(k, v) for k, v in g["body"]]
        out.append(f"<div class=\"book\"><strong>{html.escape(bname)}</strong><br>{html.escape(bdesc)}<br>"
                   f"<a class=\"button\" href=\"{blink}\" target=\"_blank\" rel=\"noopener\">See it on Amazon ↗</a></div>")
        out.append("<h2>Common questions</h2>" + "".join(f"<h3>{html.escape(q)}</h3><p>{html.escape(a)}</p>" for q, a in g["faq"]))
        rel = [o for o in GUIDES if o["slug"] != g["slug"]][:4]
        out.append("<h2>More parent guides</h2><ul class=\"related\">" +
                   "".join(f"<li><a href=\"/guides/{o['slug']}/\">{html.escape(o['title'])}</a></li>" for o in rel) + "</ul>")
        out.append(FOOT)
        os.makedirs(f"guides/{g['slug']}", exist_ok=True)
        open(f"guides/{g['slug']}/index.html", "w").write("".join(out))
    # hub
    hub = [head("Parent Guides for Social Skills and Friendship", "Free, practical guides for parents and teachers on conversation skills, personal space, joining games, accepting no, and following directions.", SITE + "/guides/"),
           "<div class=\"crumbs\"><a href=\"/\">Social Skills Rules</a></div><h1>Parent guides</h1>"
           "<p>Short, practical guides for teaching everyday friendship and learning habits at home or in class. Each one gives you a concrete next step to practice.</p><ul class=\"cards\">"]
    hub += [f"<li><a href=\"/guides/{g['slug']}/\">{html.escape(g['title'])}</a><br>{html.escape(g['desc'])}</li>" for g in GUIDES]
    hub.append("</ul>" + FOOT)
    open("guides/index.html", "w").write("".join(hub))
    # sitemap
    urls = [(SITE + "/", TODAY), (SITE + "/guides/", TODAY)] + [(f"{SITE}/guides/{g['slug']}/", TODAY) for g in GUIDES] + [(SITE + "/privacy/", "2026-10-23")]
    sm = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">" + \
         "".join(f"<url><loc>{u}</loc><lastmod>{d}</lastmod></url>" for u, d in urls) + "</urlset>\n"
    open("sitemap.xml", "w").write(sm)

if __name__ == "__main__":
    build()
