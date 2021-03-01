FROM python:3.8-slim-buster

RUN pip install pipenv

EXPOSE 5000

WORKDIR /app

# set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

ADD Pipfile /app
ADD Pipfile.lock /app
RUN pipenv install --system --deploy --ignore-pipfile

ADD . /app

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "manage:app"]
