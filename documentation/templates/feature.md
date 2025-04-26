1. When choosing a template, after selecting a summary, clicking "Use this template" should direct to the @Newsletters.jsx page

2. Where the template will be saved into the database, see @models.py for schema. It should contain a template id to track which template is being used

3. In the newsletter page @Newsletters.jsx it currently has an API that fetches summaries, it should be changed to fetch these template models, that are then displayed as the cards

4. When interacting with the fetched template cards, sending it should convert the template to html accordingly for the email, based on the template id.

5. When a user presses "Create Newsletter" it should send them to @Template.jsx 