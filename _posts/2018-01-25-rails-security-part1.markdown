---
layout: post
title: 5 things I learned about rails security during my internship
date: 2018-01-29 17:29:40 -0300
categories: jekyll update
---

When most people hear rails security they think of very specfic, unlikely
vulnerabilities you don't really have to worry since rails has a pretty high
reputation in terms of security. But independent of which framework you use, in the end it
is the developer which writes secure code or not. During my rails internship I
was mostly responsible for finding vulnerabilities in the codebase. During 3
months I could try all different kinds of things. Here I list 5 common mistakes
devolpers commit which also includes non-rails related things like server configuration.

# 1 - Mass assignments
This is probably one of the most common pitfall. The rails framework will help
you a lot when doing things quickly. Instead of assigning every value individually you
simply pass a hash with values to the update/create constructor of your model.
But this can have many downsides. The question is where these values come from. As a general rule. Be very
picky about how you handle user defined input. Once you let a user update e.g. a
user model and you don't check the passed parameters the user can change every
field (including booleans like admin, paidSubscription etc.).

{% highlight ruby %}
#.../views/users/_form.html.haml

  = f.input :email
  = f.input :name
  = f.input :last_name
  = f.input :phone

#.../controller/user_controller.rb
User.update_user(params, @current_user).

#params
{
  "email" => dummy@gmail.com,
  "name" => "Max",
  "last_name" => "Mic",
  "phone" => 15719583721,
  "is_admin" => true
}

{% endhighlight %}

Since Rails 4 there is a recommend way to go: strong parameters. Whenever you
use parameters for populating your databases you define beforehand which subset
of the parameters you want to allow. Through whitelisting allowed parameters you
are not in danger to update a field which you havn't intended.

{% highlight ruby %}
User.update_user(user_params, @current_user)

def user_params
    params.require(:user).permit(:phone, :email, :name, :last_name)
end
{% endhighlight %}

If you still use Rails 3 or lower you should consider the gem 'protected_attributes'. An official rails gem which disallows
changing attributes in a mass assignment.

# 2 - Validations
A general rule should be: Whatever information you store in your database
should be validated first. Preferably you use here a whitelist pattern for your
regular expressions. What I mean by that:
Instead of doing this (blacklisting)
{% highlight ruby %}
  validates_format_of :profile_description, :with => /<script>/, :allow_blank = true
{% endhighlight %}
You should be doing this (whitelist approach)
{% highlight ruby %}
  validates_format_of :profile_description, :with => /\A[a-zA-Z]+\z/, :allow_blank = true
{% endhighlight %}

this only allows the input you really intended.
In the first example you won't allow the script tag. But doesn't avoid the user to insert javascript. One
example is a construct like `onClick="alarm('Hi')"`, which doesn't need that tag. Or the famous
[CSS keylogger][css-keylogger] which is malicious by it's own and doesn't
need any javascript. The possibilities (see [example 1][stackoverflow-js-1] and [example 2][stackoverflow-js-2]) are too vast in order to blacklist every potentially malicous code.
Therefore we want to use a whitelist approach. In the second example we will
allow characters only, which is enough and should'nt be a limitation for the
user.

Ideally you should do this for every single form field. This is a quite messy
thing to do but I my opinion still worth it:

**a)** You don't have to worry about downstream vulnerabilities when working with
your data.

An example: You want to highlight the provided users description in
their profile. Your intern doesn't now well the haml-syntax so he does it the
html way he knows:

{% highlight haml %}
  <%= "<b>#{@user.try(:profile_description)}</b>" %>
{% endhighlight %}
He does a test and is not satisfied. Haml syntax seems to escape html by
default (luckily! - see [documentation][haml-doku]).
He quickly discovers the option html_safe. Now the html is rendered.
{% highlight haml %}
  <%= "<b>#{@user.try(:profile_description)}</b>".html_safe %>
{% endhighlight %}

If the description field is not validated beforehand we now have a entrypoint
for XSS (Cross-Site-Scripting). E.g. we could insert a small javascript snippet
which steals the user session of each user visiting your profile. A very famous example of this is the [worm Samy][samy-worm] which was affecting one
million MySpace users.
This seems very obvious and easy to avoid. But with a big codebase things get complicated and there will be a lot of other things to consider once your have
unknown user input. And now imagine several devolpers are contributing and some of them are not as security aware.

**b)** Third party apps do not have to worry about the integrity of data. You offer
an export function to allow other companies using your data in their internal
systems? Imagine they don't escape string when rendering to html.

*Important note:*
Don't use the following methods when working with user input:

{% highlight ruby %}
  update_all
  update_attribute
  update_column
  update_columns
{% endhighlight %}

They all skip validations when updating tables. You will read this at the very end
of the [official security guide][security-guide]. In my opinion it is all to easy to
use this method without knowing the implications.


# 3 - Permission policies

A basic concept for internet security is the following: It is only a question of
time till a person with malicious intent will be able to access your system.
For example through session hijacking or password spoofing or phising attacks.
With increasing user/company size this will be more likely. Now once you can assume that you have a
malicous user logged in ask yourself how can you limit the damage. Really think about secure permission policy.
Who is able to see what data under what condition. For users with critical permissions
enforce two-factor authentication, password-confirmation for critical tasks etc.

A small code sample very you typically should be very aware:

A before statement in the controller, you really shouldn't do this:


{% highlight ruby %}
class UsersController < ApplicationController

  before_action :set_user, only: [:show, :edit, :update, :destroy]

  #...

  def set_user
        @user = User.find(params[:id])

{% endhighlight %}

Instead you should check for example for current user and if the current user has permissions and redirect if the request is not valid.
{% highlight ruby %}
    def set_user
        @user = User.where(id: params[:id], account_id: current_user.account_id).first
        if @user.blank? && params[:id].present?
            redirect_to users_path
            return
          end
        end
    end
{% endhighlight %}

# 4 - SQL injection
Here a small word on SQL injection. Rails has through its model
abstraction very little problems with dependency injection. But a few methods allow to inject SQL statements which were not as intended.

{% highlight ruby %}
User.where("name = '#{params[:name]}'")

#params[:name]
"Michael" OR 'SQL-INJECTION'

{% endhighlight %}
Better write

{% highlight ruby %}
User.where(:name => params[:name])
{% endhighlight %}

For a more examples and a better understanding I really can recommend the site [rails-sqli][rails-sqli] 


# 5 - Check your buckets!

This is a big one. You might not believe what things you can find on the
internet when you search for some random amazon aws buckets. This is a very
obvious thing but this is actually not that unlikely. Imagine the following
scenario: You do some tests in sub folder of your bucket. The tests fail you try switching it to public to check if
it is a permission issue. You forget to restore to private permission.
Later you decide to store there some backups. There is a bunch of crawlers who
are just looking for badly secured buckets. Always check your permissions, at
best automatically (for larger cases consider using like the open source software [edda from
netflix][edda-netflix]).



# Further resources

- If you have time, go through the official security guide: <http://guides.rubyonrails.org/security.html>
- Read into tools like brakeman. Automated testing which also will recommend you certain patches and updates of dependencies: <https://github.com/presidentbeef/brakeman>
- RailsGoat, a very good tutorial/resource where you have to fix an example app: <https://github.com/OWASP/railsgoat> 



-------------




[css-keylogger]: https://hackaday.com/2018/02/25/css-steals-your-web-data/
[haml-doku]: http://haml.info/docs/yardoc/file.REFERENCE.html#rails-xss-protection
[samy-worm]: https://en.wikipedia.org/wiki/Samy_(computer_worm)
[security-guide]: http://guides.rubyonrails.org/active_record_validations.html
[stackoverflow-js-1]: https://stackoverflow.com/questions/37435077/execute-javascript-for-xss-without-script-tags
[stackoverflow-js-2]: https://stackoverflow.com/questions/476276/using-javascript-in-css
[rails-sqli]: https://rails-sqli.org/
[edda-netflix]:https://github.com/Netflix/edda

