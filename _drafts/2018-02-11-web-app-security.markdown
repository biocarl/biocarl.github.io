---
layout: post
title: 10 security principles I learned during my internship
date: 2018-02-22
categories: security web 
---

### 1 - Mind the user input
    The most simple but most important principle.

### 2 - front end is no security barrier. Double check everything in the backend
    This is rather obvious but nevertheless a common error since a developer
    can't think of everything at every given moment. Very often you will see
    form validations in the front end which are less forgiving than those in the
    backend.

### 3 - implementing something by your own in the security context is most likely the
    wrong thing to do. e.g. in the context of authentication: Use firebase or devise (rails
    specfic)

### 4 - Getting hacked is only a question of time
    Suppose the following: It is only a question of time till a hacker gains
    access to one of your user accounts. For example through session hijacking or
    password spoofing or phising attacks (article on this soon). With increasing
    user/company size this will be more likely. Now once you can assume that you have a
    malicous user logged in ask yourself how can you limit the damage. Really think about
    secure permission policy. Who is able to see what data under what condition. For users with
    critical permissions enforce two-factor authentication,
    password-confirmation for critical tasks etc.

### 5 - Stay up to date! Every month new vulnerabilities are discovered and published.
    To not update your framework and it's dependencies is certainly no good
    idea. There is even grawlers on the web and who look for apps which havn't
    fixed those update yet.

### 6 - Don't fix vulnerabilities by yourself. Update your framework or dependency or
    use a provided (official!) patch if you can't update that easily.

### 7 - Know when you got hacked. Define several metrics in order to know when you
    have a data leak. In the same fashion you use assert methods in your code
    you should create custom alarms when unexpected things happen. Some
    scenarios:
    - In a private bucket you store weekly backups of your user data. Usually
        you store them there (write-only). Get an alert when you logged
        read-access which doesn't equal the creation date of the backup.
    - You have a big e-mail list. Store a fake e-mail which should only recieve
        email's of your service. If not your e-mail list was probably stolen.
    - If you are a bigger company and have the resources consider setting up
        honeypots[link-wikipedia].
    - Use services like: <https://urlcanary.com>

### 8 - At least test your security relevant components. It can happen very quickly
    that you change some null test and suddenly you can login in into every
    account without needing a valid password. Changing the codebase and having buggy features
    is one thing, but having big security issues is another and can cause
    irreversible damage for you and your clients.

### 9 - Further: Use automated tools which do a static code analysis e.g. brakeman (Rails specfic)

### 10 - always prefer whitelisting over blacklisting (e.g. form field validation, email etc.)
