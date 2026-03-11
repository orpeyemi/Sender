# Amazon SES Sandbox Exit / Limit Increase Application Guide

When applying to move out of the Amazon SES sandbox or requesting a limit increase, Amazon's compliance team manually reviews your application. Use the template below as a starting point, ensuring you customize the bracketed information to match your actual business practices.

---

## Application Template

### 1. Email Sending Process and Procedures
"Our application, **Pro Email Sender**, is a specialized tool designed for [Your Business Purpose, e.g., sending internal company updates / transactional notifications to registered users]. We use a controlled, sequential sending process with a randomized 12-15 second delay between each email to ensure we do not overwhelm recipient servers and to maintain high deliverability standards."

### 2. Sending Frequency
"We plan to send emails [Frequency, e.g., daily / weekly / twice a month]. On average, we expect to send approximately [Number] emails per batch, with a total monthly volume of [Total Monthly Volume]."

### 3. Recipient List Maintenance
"Our recipient lists are strictly **opt-in only**. We do not use purchased or third-party lists. Users are added to our database when they [Method, e.g., sign up for our service / subscribe to our newsletter via our website]. We perform regular list hygiene by removing inactive users and verifying email formats before sending."

### 4. Managing Bounces, Complaints, and Unsubscribe Requests
*   **Bounces & Complaints:** "We have configured Amazon SES notifications via Amazon SNS (Simple Notification Service) to track bounces and complaints. Any email address that results in a 'Hard Bounce' or a 'Complaint' is automatically flagged in our system and excluded from all future mailings."
*   **Unsubscribes:** "Every email sent includes a clear, functional unsubscribe link. When a user clicks this link, they are immediately moved to a suppression list, and our application logic prevents any further emails from being sent to that address."

### 5. Examples of Content
"We primarily send [Type of Content, e.g., account verification codes, password resets, and weekly project status reports]. Below is a typical example:

**Subject:** [Example Subject, e.g., Your Weekly Project Update]
**Body:**
Hello [Name],
Here is the progress report for your current project...
[Link to Dashboard]
To unsubscribe, click here: [Unsubscribe Link]"

---

## Pro-Tips for Approval:
1.  **Be Specific:** Don't use vague terms. Instead of "often," say "three times a week."
2.  **Focus on Opt-in:** Amazon is very strict about spam. Emphasize that your users *asked* to receive these emails.
3.  **Mention Automation:** Mentioning that you use SNS to handle bounces automatically shows you are a professional sender.
4.  **Avoid Spam Keywords:** Ensure your example content doesn't use the keywords our app flags (like "FREE", "WIN", "CASH").
