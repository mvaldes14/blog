---
title: Use Pipenv, seriously
description: Python environments are a mess, use pipenv
date: 2019-01-15
status: "Complete"
---

So not too long ago i wrote a post about how a lot of people manager their virtualenvs and for a long time this approach has been working fine, until i recently saw on twitter something called ‘pipenv’ so i was curious about it… so here we are today.

Pipenv is another way of managing your virtual installations for packages/libraries so you don’t overload your current python installation and it does it in a super fancy and simple way. Also i should mention that now python.org suggest using this tool for managing libraries and packages.

You will find a very nice screen-cast of the creator, legend Kenneth Reitz in their []main docs repo](https://docs.pipenv.org/). So please go ahead and check out the video.

If you are done with it then let’s test it out. Most of us either start new repos or copy something from someone in GitHub, now based on what i can see almost everyone is still using the requirements.txt file to indicate what dependencies and libraries were used for a certain project. So we will do a quick test on how to tackle both approaches.

# Starting a new repo

So you have an idea of doing an application that will facilitate your life in some way, cool so now that we have pipenv we will create a folder with our project and start a virtualenv. We will be using python 3, because you know…. python 2 is going away so why are you still using it fool?!

```sh
mkdir new_cool_project && cd new_cool_project
pipenv --three
Creating a virtualenv for this project…
Using /usr/bin/python3 to create virtualenv…
⠋Running virtualenv with interpreter /usr/bin/python3
Using base prefix '/usr'
New python executable in /home/$USER/.local/share/virtualenvs/new_cool_project-VeVqBp3O/bin/python3
Also creating executable in /home/$USER/.local/share/virtualenvs/new_cool_project-VeVqBp3O/bin/python
Installing setuptools, pip, wheel...done.
```

As simple as that you have a virtualenv that is not currently hosted inside your repo folder, which is super nice cause you tend to either add it to your .gitignore or most people do actually upload it to their projects as well which adds a bunch of files that are not truly needed at all.

**NOTE**: If you want to do some cleanup, all of your envs will be located in the following path assuming you are using linux/mac:

`/home/$USER/.local/share/virtualenvs/`

Now, you will see a new file in your project repo called Pipfile. You can think of this as your requirements.txt sort of as it will contain your dependencies and python version information.

```toml
[[source]]
url = "https://pypi.python.org/simple"
verify_ssl = true
name = "pypi"


[packages]


[dev-packages]


[requires]
python_version = "3.6"
```

So you are set, now if you want to install libraries simply do:

```sh
pipenv package_name example....
pipenv install flask

Installing flask…
Collecting flask
Using cached Flask-0.12.2-py2.py3-none-any.whl
Collecting Jinja2>=2.4 (from flask)
Using cached Jinja2-2.10-py2.py3-none-any.whl
Collecting itsdangerous>=0.21 (from flask)
Collecting Werkzeug>=0.7 (from flask)
Using cached Werkzeug-0.14.1-py2.py3-none-any.whl
Collecting click>=2.0 (from flask)
Using cached click-6.7-py2.py3-none-any.whl
Collecting MarkupSafe>=0.23 (from Jinja2>=2.4->flask)
Installing collected packages: MarkupSafe, Jinja2, itsdangerous, Werkzeug, click, flask
Successfully installed Jinja2-2.10 MarkupSafe-1.0 Werkzeug-0.14.1 click-6.7 flask-0.12.2 itsdangerous-0.24

Adding flask to Pipfile's [packages]…
Locking [dev-packages] dependencies…
Locking [packages] dependencies…
Updated Pipfile.lock (011179)!
```

Now you have another file Pipfile.lock which contains security and specific data tied to the libraries or packages you installed. This is a huge benefit compared to the regular old way of just simply pip installing everything as you can validate the hashes to make sure you indeed installed what you needed and not something that was altered by a third party.

```json
"flask": {
          "hashes": [
              "sha256:0749df235e3ff61ac108f69ac178c9770caeaccad2509cb762ce1f65570a8856",
              "sha256:49f44461237b69ecd901cc7ce66feea0319b9158743dd27a2899962ab214dac1"
          ],
          "version": "==0.12.2"
```

Installing a file also updates your original Pipfile with the new installed packages so you have everything ready and with less commands in your terminal. Now you can share your project information and people can install it from the data in your pipfile.

## Cloning a repo

So now what i believe is the most common scenario, you found a super cool project in Github/GitLab or whatever SCM you use and you want to use it, problem is, it contains a requirements.txt file…. not a problem for pipenv!

git clone super_nice_project
Once you have the project available, simply create your virtualenv and then install the dependencies in the requirements.txt file by letting pipenv know where to find it.

```sh
pipenv --three
pipenv install -r requirements.txt

Requirements file provided! Importing into Pipfile…
Pipfile.lock not found, creating…
Locking [dev-packages] dependencies…
Locking [packages] dependencies…
Updated Pipfile.lock (956749)!
Installing dependencies from Pipfile.lock (956749)
```

# Conclusion

So now you know the basics on how to use pipenv so please go ahead and upgrade how you manage your projects, not only its easier to install and keep control of things but it also offers a lot of different cool concepts and features we didn’t cover here like spawning the virtualenv in a shell so you can run commands directly for things like Flask that demand you to launch it directly from the environment to test it out, which is similar to doing the good ol’ source env/bin/activate. Also having dev only dependencies, etc.
