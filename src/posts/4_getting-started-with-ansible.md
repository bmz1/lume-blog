---
title: "Getting Started With Ansible"
slug: "getting-started-with-ansible"
image: 'img/ansible.webp'
date: 2020-04-22
author: bmz
tags: ["ansible", "devops", "raspberry", "cloud", "infrastructure"]
description: "A tutorial to help you understand the basics of Ansible - an open-source software provisioning, configuration management, and application-deployment tool.
"
canonicalUrl: "https://blog.risingstack.com/getting-started-with-ansible-infrastructure-automation/"
metas:
  title: 'Getting Started With Ansible'
  description: 'A tutorial to help you understand the basics of Ansible - an open-source software provisioning, configuration management, and application-deployment tool'
  image: 'img/ansible.webp'
---

**Co-author: Tamas Kadlecsik**

After going through this tutorial, you’ll understand the basics of Ansible - an open-source software provisioning, configuration management, and application-deployment tool.

First, we’ll discuss the Infrastructure as Code concept, and we’ll also take a thorough look at the currently available IaC tool landscape. Then, we’ll dive deep into what is Ansible, how it works, and what are the best practices for its installation and configuration. You’ll also learn how to automate your infrastructure with Ansible in an easy way.

**Table of contents:**

- Understanding the Infrastructure as a Code concept
- What is Ansible?
- How to Install Ansible
- Ansible Setup
- Final words and further readings

## What is Infrastructure as Code?

_a.k.a understanding the IaC Concept_

Since the dawn of complex Linux server architectures, the way of configuring servers was either by using the command line, or by using bash scripts. However, the problem with bash scripts is that they are quite difficult to read, but more importantly, using bash scripts is a completely imperative way.

When relying on bash scripts, implementation details or small differences between machine states can break the configuration process. There’s also the question of what happens if someone SSH-s into the server, configures something through the command line, then later someone would try to run a script, expecting the old state.

The script might run successfully, simply break, or things could completely go haywire. No one can tell.

To alleviate the pain caused by the drawbacks of defining our server configurations by bash scripts, we needed a declarative way to apply idempotent changes to the servers’ state, meaning that it does not matter how many times we run our script, it should always result in reaching the exact same expected state.

> This is the idea behind the Infrastructure as Code (IaC) concept: handling the state of infrastructure through idempotent changes, defined with an easily readable, domain-specific language.

### What are these declarative approaches?

First, Puppet was born, then came Chef. Both of them were responses to the widespread adoption of using clusters of virtual machines that need to be configured together.

Both Puppet and Chef follow the so-called “pull-based” method of configuration management. This means that you define the configuration - using their respective domain-specific language- which is stored on a server. When new machines are spun up, they need to have a configured client that pulls the configuration definitions from the server and applies it to itself.

Using their domain-specific language was definitely clearer and more self-documenting than writing bash scripts. It is also convenient that they apply the desired configuration automatically after spinning up the machines.

However, one could argue that the need for a preconfigured client makes them a bit clumsy. Also, the configuration of these clients is still quite complex, and if the master node which stores the configurations is down, all we can do is to fall back to the old command line / bash script method if we need to quickly update our servers.

## To avoid a single point of failure, Ansible was created.

Ansible, like Puppet and Chef, sports a declarative, domain-specific language, but in contrast to them, Ansible follows a “push-based” method. That means that as long as you have Python installed, and you have an SSH server running on the hosts you wish to configure, you can run Ansible with no problem. We can safely say that expecting SSH connectivity from a server is definitely not inconceivable.

> Long story short, Ansible gives you a way to push your declarative configuration to your machines.

Later came SaltStack. It also follows the push-based approach, but it comes with a lot of added features, and with it, a lot of added complexity both usage, and maintenance-wise.

**Thus, while Ansible is definitely not the most powerful of the four most common solutions, it is hands down the easiest to get started with, and it should be sufficient to cover 99% of conceivable use-cases.**

If you’re just getting started in the world of IaC, Ansible should be your starting point, so let’s stick with it for now.

### Other IaC tools you should know about

While the above mentioned four (Pupper, Chef, Salt, Ansible) handles the configuration of individual machines in bulk, there are other IaC tools that can be used in conjunction with them. Let’s quickly list them for the sake of completeness, and so that you don’t get lost in the landscape.

**Vagrant:** It has been around for quite a while. Contrary to Puppet, Chef, Ansible, and Salt, Vagrant gives you a way to create blueprints of virtual machines. This also means that you can only create VMs using Vagrant, but you cannot modify them. So it can be a useful companion to your favorite configuration manager, to either set up their client, or SSH server, to get them started.

**Terraform:** Vagrant comes handy before you can use Ansible, if you maintain your own fleet of VMs. If you’re in the cloud, Terraform can be used to declaratively provision VMs, setup networks, or basically anything you can handle with the UI, API, or CLI of your favorite cloud provider. Feature support may vary, depending on the actual provider, and they mostly come with their own IaC solutions as well, but if you prefer not to be locked in to a platform, Terraform might be the best solution to go with.

**Kubernetes:** Container orchestration systems are considered Infrastructure as Code, as especially with Kubernetes, you have control over the internal network, containers, a lot of aspects of the actual machines, basically it’s more like an OS on it’s own right than anything. However, it requires you to have a running cluster of VMs with Kubernetes installed and configured.

All in all, you can use either Vagrant or Terraform to lay the groundwork for your fleet of VMs, then use Ansible, Puppet, Chef or Salt to handle their configuration continuously. Finally, Kubernetes can give you a way to orchestrate your services on them.

We’ve previously written a [lot about Kubernetes](https://blog.risingstack.com/what-is-kubernetes-how-to-get-started/), so this time we’ll take one step and take a look at our favorite remote configuration management tool: Ansible.

## What is Ansible?

Let’s take apart what we already know:

Ansible is a push-based IaC, providing a user-friendly domain-specific language so you can define your desired architecture in a declarative way.

Being **push-based means** that Ansible uses SSH for communicating between the machine that runs Ansible and the machines the configuration is being applied to.

The machines we wish to configure using Ansible are called **managed nodes** or **hosts**. In Ansible’s terminology, the list of hosts is called an **inventory**.

The machine that reads the definition files and runs Ansible to push the configuration to the hosts is called a **control node**.

## How to Install Ansible

It is enough to install Ansible only on one machine, the control node.

Control node requirements are the following:

- Python 2 (version 2.7) or Python 3 (versions 3.5 and higher) installed
- Windows is not supported as a control node, but you can set it up on Windows 10 using [WSL](https://docs.microsoft.com/en-us/windows/wsl/install-win10)
- Managed nodes also need Python to be installed.

### RHEL and CentOS

```bash
sudo yum install ansible
```

### Debian based distros and WSL

```bash
sudo apt update
sudo apt install software-properties-common
sudo apt-add-repository --yes --update ppa:ansible/ansible
sudo apt install ansible
```

### MacOS

The preferred way to install Ansible on a Mac is via `pip`.

```bash
pip install --user ansible
```

Run the following command to verify the installation:

```bash
ansible --version
```

## Ansible Setup, Configuration, and Automation

For the purposes of this tutorial, we’ll set up a Raspberry Pi with Ansible, so even if the SD card gets corrupted, we can quickly set it up again and continue working with it.

1. Flash image (Raspbian)
2. Login with default credentials (pi/raspberry)
3. Change default password
4. Set up passwordless SSH
5. Install packages you want to use

**With Ansible, we can automate the process.**

Let’s say we have a couple of Raspberry Pis, and after installing the operating system on them, we need the following packages to be installed on all devices:

- vim
- wget
- curl
- htop

We could install these packages one by one on every device, but that would be tedious. Let Ansible do the job instead.

First, we’ll need to create a project folder.

```bash
mkdir bootstrap-raspberry && cd bootstrap-raspberry
```

We need a config file and a hosts file. Let’s create them.

```bash
touch ansible.cfg
touch hosts 		// file extension not needed
```

Ansible can be configured using a config file named `ansible.cfg`. You can find an example with all the options [here](https://github.com/ansible/ansible/blob/devel/examples/ansible.cfg).

**Security risk**: if you load `ansible.cfg` from a world-writable folder, another user could place their own config file there and run malicious code. More about that [here](https://docs.ansible.com/ansible/latest/reference_appendices/config.html#avoiding-security-risks-with-ansible-cfg-in-the-current-directory).

The lookup order of the configuration file will be searched for in the following order:

1. `ANSIBLE_CONFIG` (environment variable if set)
2. `ansible.cfg` (in the current directory)
3. `~/.ansible.cfg` (in the home directory)
4. `/etc/ansible/ansible.cfg`

So if we have an `ANSIBLE_CONFIG` environment variable, Ansible will ignore all the other files(2., 3., 4.). On the other hand, if we don’t specify a config file, `/etc/ansible/ansible.cfg` will be used.

Now we’ll use a very simple config file with contents below:

```yml
[defaults]
inventory = hosts
host_key_checking = False
```

Here we tell Ansible that we use our `hosts` file as an inventory and to not check host keys. Ansible has host key checking enabled by default. If a host is reinstalled and has a different key in the `known_hosts` file, this will result in an error message until corrected. If a host is not initially in `known_hosts` this will result in prompting for confirmation interactively which is not favorable if you want to automate your processes.

Now let’s open up the `hosts` file:

```yml
[raspberries]
192.168.0.74
192.168.0.75
192.168.0.76

[raspberries:vars]
ansible_connection=ssh
ansible_user=pi
ansible_ssh_pass=raspberry
```

We list the IP address of the Raspberry Pis under the `[raspberries]` block and then assign variables to them.

- `ansible_connection`: Connection type to the host. Defaults to `ssh`. See other connection types [here](https://docs.ansible.com/ansible/latest/plugins/connection.html)
- `ansible_user`: The user name to use when connecting to the host
- `ansible_ssh_password`: The password to use to authenticate to the host

## Creating an Ansible Playbook

Now we’re done with the configuration of Ansible. We can start setting up the tasks we would like to automate. Ansible calls the list of these tasks “playbooks”.

In our case, we want to:

1. Change the default password,
2. Add our SSH public key to `authorized_keys`,
3. Install a few packages.

Meaning, we’ll have 3 tasks in our playbook that we’ll call `pi-setup.yml`.

By default, Ansible will attempt to run a playbook on all hosts in parallel, but the tasks in the playbook are run serially, one after another.

Let’s take a look at our `pi-setup.yml` as an example:

```yml
- hosts: all
 become: 'yes'
 vars:
   user:
     - name: "pi"
       password: "secret"
       ssh_key: "ssh-rsa …"
   packages:
     - vim
     - wget
     - curl
     - htop
 tasks:
   - name: Change password for default user
     user:
       name: '"{{ item.name }}"'
       password: '"{{ item.password | password_hash('sha512') }}"'
       state: present
     loop:
       - '"{{ user }}"'
   - name: Add SSH public key
     authorized_key:
       user: '"{{ item.name }}"'
       key: '"{{ item.ssh_key }}"'
     loop:
       - '"{{ user }}"'
   - name: Ensure a list of packages installed
     apt:
       name: '"{{ packages }}"'
       state: present
   - name: All done!
     debug:
       msg: Packages have been successfully installed
```

## Tearing down our Ansible Playbook Example

Let’s tear down this playbook.

```yaml
hosts: all
become: yes
vars:
  user:
{ name: “pi”, password: “secret”, ssh_key: “ssh-rsa …” }

tasks: [ … ]
```

This part defines fields that are related to the whole playbook:

1. `hosts: all`: Here we tell Ansible to execute this playbook on all hosts defined in our hostfile.
2. `become: yes`: Execute commands as sudo user. Ansible uses [privilege escalation systems](https://docs.ansible.com/ansible/latest/user_guide/become.html) to execute tasks with root privileges or with another user’s permissions. This lets you _become_ another user, hence the name.
3. `vars`: User defined variables. Once you’ve defined variables, you can use them in your playbooks using the [Jinja2 templating system](https://docs.ansible.com/ansible/latest/user_guide/playbooks_templating.html).There are other sources `vars` can come from, such as variables discovered from the system. These variables are called [facts](https://docs.ansible.com/ansible/latest/user_guide/playbooks_variables.html#variables-discovered-from-systems-facts).
4. `tasks`: List of commands we want to execute

Let’s take another look at the first task we defined earlier without addressing the user modules’ details. Don’t fret if it’s the first time you hear the word “module” in relation to Ansible, we’ll discuss them in detail later.

```yaml
tasks:
  - name: Change password for default user # task
    user: { ... } # module
    loop:
      - '{{ user }}'
```

5. `name`: Short description of the task making our playbook self-documenting.
6. `user`: The module the task at hand configures and runs. Each module is an object encapsulating a desired state. These modules can control system resources, services, files or basically anything. For example, the documentation for the `user` module can be found [here](https://docs.ansible.com/ansible/latest/modules/user_module.html). It is used for managing user accounts and user attributes.
7. `loop`: Loop over variables. If you want to repeat a task multiple times with different inputs, [`loops`](https://docs.ansible.com/ansible/latest/user_guide/playbooks_loops.html) come in handy. Let’s say we have 100 users defined as variables and we’d like to register them. With loops, we don’t have to run the playbook 100 times, just once.

## Understanding the Ansible User Module

Zooming in on the user module:

```yaml
user:  # module
       name: “{{ item.name }}”
       password: "{{ item.password | password_hash('sha512') }}"
       state: present
 loop:
       - "{{ user }}"
```

Ansible comes with a number of modules, and each module encapsulates logic for a specific task/service. The user module above defines a user and its password. It doesn’t matter if it has to be created or if it’s already present and only its password needs to be changed, Ansible will handle it for us.

Note that Ansible will only accept hashed passwords, so either you provide pre-hashed characters or - as above - use a hashing [filter](https://docs.ansible.com/ansible/latest/user_guide/playbooks_filters.html).

For the sake of simplicity, we stored our user’s password in our example playbook, but **you should never store passwords in playbooks directly**. Instead, you can use variable flags when running the playbook from CLI or use a password store such as [Ansible Vault](https://docs.ansible.com/ansible/latest/user_guide/vault.html) or the [1Password module](https://docs.ansible.com/ansible/latest/plugins/lookup/onepassword.html) .

Most modules expose a `state` parameter, and it is best practice to explicitly define it when it’s possible. State defines whether the module should make something present (add, start, execute) or absent (remove, stop, purge). Eg. create or remove a user, or start / stop / delete a Docker container.

Notice that the user module will be called at each iteration of the loop, passing in the current value of the `user` variable . The loop is not part of the module, it’s on the outer indentation level, meaning it’s task-related.

## The Authorized Keys Module

The `authorized_keys` module adds or removes SSH authorized keys for a particular user’s account, thus enabling passwordless SSH connection.

```yaml
- name: Add SSH public key # task
  authorized_key:
    user: '{{ item.name }}'
    key: '{{ item.ssh_key }}'
```

The task above will take the specified `key` and adds it to the specified `user`’s `~/.ssh/authorized_keys` file, just as you would either by hand, or using `ssh-copy-id`.

## The Apt module

We need a new `vars` block for the packages to be installed.

```
vars:
   packages:
   - vim
   - wget
   - curl
   - htop

 tasks:
   - name: Ensure a list of packages installed
     apt:
       name: "{{ packages }}"
       state: present
```

The `apt` module manages apt packages (such as for Debian/Ubuntu). The `name` field can take a list of packages to be installed. Here, we define a variable to store the list of desired packages to keep the task cleaner, and this also gives us the ability to overwrite the package list with command-line arguments if we feel necessary when we apply the playbook, without editing the actual playbook.

The `state` field is set to be present, meaning that Ansible should install the package if it’s missing, or skip it, if it’s already present. In other words, it ensures that the package is present. It could be also set to `absent` (ensure that it’s not there), `latest` (ensure that it’s there and it’s the latest version, `build-deps` (ensure that it’s build dependencies are present), or `fixed` (attempt to correct a system with broken dependencies in place).

## Let’s run our Ansible Playbook

Just to reiterate, here is the whole playbook together:

```yaml
- hosts: all
  become: yes
  vars:
   user:
{ name: “pi”, password: “secret”, ssh_key: “ssh-rsa …” }
   packages:
   - vim
   - wget
   - curl
   - htop
 tasks:
   - name: Change password for default user
     user:
       name: “{{ item.name }}”
       password: "{{ item.password | password_hash('sha512') }}"
       state: present
     loop:
       - "{{ user }}"
   - name: Add SSH public key
     authorized_key:
       user: "{{ item.name }}"
       key: "{{ item.ssh_key }}"
     loop:
       - "{{ user }}"
 - name: Ensure a list of packages installed
    apt:
       name: "{{ packages }}"
       state: present
- name: All done!
     debug:
       msg: Packages have been successfully installed
```

Now we’re ready to run the playbook:

```
ansible-playbook pi-setup.yml
```

Or we can run it with overwriting the config file:

```bash
$ ANSIBLE_HOST_KEY_CHECKING=False

$ ansible-playbook - i “192.168.0.74, 192.168.0.75” ansible_user=john  ansible_ssh_pass=johnspassword” -e  ‘{“user”: [{ “name”: “pi”, “password”: “raspberry”, “state”: “present” }] }’ -e '{"packages":["curl","wget"]}' pi-setup.yml
```

The command-line flags used in the snippet above are:

- -i (inventory): specifies the inventory. It can either be a comma-separated list as above, or an inventory file.
- -e (or --extra-vars): variables can be added or overridden through this flag. In our case we are overwriting the configuration laid out in our `hosts` file (`ansible_user`, `ansible_ssh_pass`) and the variables `user` and `packages` that we have previously set up in our playbook.

## What to use Ansible for

Of course, Ansible is not used solely for setting up home-made servers.

Ansible is used to manage VM fleets in bulk, making sure that each newly created VM has the same configuration as the others. It also makes it easy to change the configuration of the whole fleet together by applying a change to just one playbook.

But Ansible can be used for a plethora of other tasks as well. If you have just a single server running in a cloud provider, you can define its configuration in a way that others can read and use easily. You can also define maintenance playbooks as well, such as creating new users and adding the SSH key of new employees to the server, so they can log into the machine as well.

Or you can use [AWX](https://github.com/ansible/awx) or [Ansible Tower](https://docs.ansible.com/ansible/latest/reference_appendices/tower.html) to create a GUI based Linux server management system that provides a similar experience to what Windows Servers provide.

\*Stay tuned and subscribe to our newsletter! You can find the subscribe box in the left column, [on the top of the article].

Next time, we’ll dive deeper into an enterprise use case of Ansible with AWX.
