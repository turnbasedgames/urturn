import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { createGame, GameReqBody } from '../models/game';
import classes from './CreateView.module.css';

const githubURLRegExp = new RegExp('^https://(www.)?github.com/.*/.*$');

const CreateView = () => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    githubURL: '',
    commitSHA: '',
  });
  const [errors, setErrors] = useState({ githubURL: '' });
  const history = useHistory();

  const setField = (field: string, value: string) => {
    setForm({
      ...form,
      [field]: value,
    });
  };

  return (
    <div className={classes.form}>
      <h1>Create Game</h1>
      <Form
        onSubmit={async (event: any) => {
          event.preventDefault();

          if (githubURLRegExp.test(form.githubURL)) {
            const gameObj: GameReqBody = form;
            const game = await createGame(gameObj);
            history.push(`/games/${game.id}`);
          } else setErrors({ githubURL: 'Please enter a valid GitHub URL.' });
        }}
      >
        <Form.Group controlId="name">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            onChange={(e) => setField('name', e.target.value)}
            placeholder="Enter name"
            required
          />
        </Form.Group>
        <Form.Group controlId="description">
          <Form.Label>Description</Form.Label>
          <Form.Control
            type="text"
            onChange={(e) => setField('description', e.target.value)}
            placeholder="Enter description"
            required
          />
        </Form.Group>
        <Form.Group controlId="github">
          <Form.Label>GitHub Repository URL</Form.Label>
          <Form.Control
            type="text"
            onChange={(e) => setField('githubURL', e.target.value)}
            placeholder="Enter GitHub repository URL"
            required
            isInvalid={!!errors.githubURL}
          />
          <Form.Control.Feedback type="invalid">
            {errors.githubURL}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group controlId="commit">
          <Form.Label>Commit SHA</Form.Label>
          <Form.Control
            type="text"
            onChange={(e) => setField('commitSHA', e.target.value)}
            placeholder="Enter commit SHA"
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Form>
    </div>
  );
};

export default CreateView;
