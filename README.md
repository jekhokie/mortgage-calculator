# Mortgage Calc

This application is a simple mortgage calculator allowing a user to input their mortgage parameters
and obtain a monthly payment breakdown, total cost of loan and amortization schedule.

## Dependencies

This application requires the following dependencies and assumes the user installing the
application already has or will be able to install and configure the respective technologies:

- RVM
- Ruby 2.1.0

Please see the Gemfile for a complete list of required dependencies.

## Installation and Configuration

- Clone the application repository:

```bash
git clone https://github.com/jekhokie/mortgage-calc.git
cd mortgage-calc
```

- Install the required dependencies:

```bash
bundle install
```

- Start the Mortgage Calculator application:

```bash
bundle exec rackup --host 0.0.0.0 --port 5000
```

- Visit the application:

```bash
http://<YOUR_SERVER_OR_IP>:5000/
```

## Disclaimer

This application is a best-effort attempt to calculate costs associated with a typical/conventional mortgage.
It should in no way be entirely depended upon and the developer makes no guarantee as to the level of accuracy
of the numbers calculated. Usage of this tool implies that the user is relieving the developer of all misfortunes
or issues related to or as a result of the data provided within the tool.
