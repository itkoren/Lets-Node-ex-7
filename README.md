Seventh Exercise (Express)
=================================================

Please complete the following steps:

1. Refactor **"sentigator"** server to use **"express"**. Do it by:
 * Creating a **"routes"** directory
 * Creating a **"content.js"** file inside the new **"routes"** directory
 * Moving the request handling code to a middleware defined for path "/" inside **"content.js"** file
 * Removing usage of **"url"** module and letting **"express"** do the parsing
 * Creating an **"express"** application and defining the IP and PORT for it to use
 * Registering the content routes for path "/content"

2. Add **"errorhandler"** middleware for **"development"** and **"production"** environments

3. Add logging using **"morgan"** middleware for **"development"** environment only

4. Add a middleware for handling errors and logging the stack

5. Add **"response-time"** middleware for monitoring the response time (**HINT: location, location, location**)

6. Hook up the fancy client. Do it by:
 * Adding **"jade"** module as a templates engine
 * Creating a **"index.js"** file inside the **"routes"** directory
 * Adding **"index"** rendering using the following `res.render("index", { title: "Welcome to Sentigator" });` code in a middleware defined for path "/" inside **"index.js"** file
 * Registering the index routes for path "/"
 * Assigning **"jade"** as the **"express"** application "view engine"
 * Assigning an application setting key **"views"** to hold the path to the **"views"** directory
 * Using the **"express"** static middleware pointed to the **"public"** directory of the **"express"** application

#####Use the **"sentiment"** and the **"sentigator"** modules in this repository as a starting point for the exercise