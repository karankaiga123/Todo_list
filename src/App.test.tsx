import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import App from './App';

describe('Todo App', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('renders correctly', () => {
        render(<App />);
        expect(screen.getByText('My Tasks')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('What needs to be done?')).toBeInTheDocument();
    });

    it('adds a new todo', () => {
        render(<App />);
        const input = screen.getByPlaceholderText('What needs to be done?');
        const button = screen.getByRole('button', { name: '' }); // Plus icon button

        fireEvent.change(input, { target: { value: 'New Task' } });
        fireEvent.click(button);

        expect(screen.getByText('New Task')).toBeInTheDocument();
    });

    it('toggles a todo', () => {
        render(<App />);
        const input = screen.getByPlaceholderText('What needs to be done?');
        const addButton = screen.getByRole('button', { name: '' });

        fireEvent.change(input, { target: { value: 'Task to toggle' } });
        fireEvent.click(addButton);

        const taskText = screen.getByText('Task to toggle');
        fireEvent.click(taskText);

        // After clicking, it should be completed (checked)
        // We check via class or visual state, but text presence is main check.
        // In our implementation, opacity-50 is applied to completed items
        const taskContainer = taskText.closest('.glass');
        expect(taskContainer).toHaveClass('opacity-50');
    });

    it('deletes a todo', async () => {
        render(<App />);
        const input = screen.getByPlaceholderText('What needs to be done?');
        const addButton = screen.getByRole('button', { name: '' });

        fireEvent.change(input, { target: { value: 'Task to delete' } });
        fireEvent.click(addButton);

        const deleteButton = screen.getByLabelText('Delete todo');
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(screen.queryByText('Task to delete')).not.toBeInTheDocument();
        });
    });

    it('filters todos', async () => {
        render(<App />);
        const input = screen.getByPlaceholderText('What needs to be done?');
        const addButton = screen.getByRole('button', { name: '' });

        // Add active task
        fireEvent.change(input, { target: { value: 'Active Task' } });
        fireEvent.click(addButton);

        // Add completed task
        fireEvent.change(input, { target: { value: 'Completed Task' } });
        fireEvent.click(addButton);
        fireEvent.click(screen.getByText('Completed Task')); // Toggle logic

        // Filter by Active
        fireEvent.click(screen.getByText('active'));
        expect(screen.getByText('Active Task')).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.queryByText('Completed Task')).not.toBeInTheDocument();
        });

        // Filter by Completed
        fireEvent.click(screen.getByText('completed'));
        await waitFor(() => {
            expect(screen.queryByText('Active Task')).not.toBeInTheDocument();
        });
        expect(screen.getByText('Completed Task')).toBeInTheDocument();
    });

    it('clears completed todos', async () => {
        render(<App />);
        const input = screen.getByPlaceholderText('What needs to be done?');
        const addButton = screen.getByRole('button', { name: '' });

        fireEvent.change(input, { target: { value: 'Task 1' } });
        fireEvent.click(addButton);
        fireEvent.click(screen.getByText('Task 1')); // Complete it

        fireEvent.change(input, { target: { value: 'Task 2' } });
        fireEvent.click(addButton); // Keep active

        fireEvent.click(screen.getByText('Clear Completed'));

        await waitFor(() => {
            expect(screen.queryByText('Task 1')).not.toBeInTheDocument();
        });
        expect(screen.getByText('Task 2')).toBeInTheDocument();
    });
});
