import { TaskPriority, ValidationErrors } from '../types/Task';

export interface FormValidationInput {
  title: string;
  description: string;
  deadline: Date | string | null;
  priority: TaskPriority | string;
  isEditing?: boolean;
}

/**
 * Validates task form fields according to academic requirements.
 * Returns an object containing error messages for invalid fields, or empty object if valid.
 */
export const validateTaskForm = (input: FormValidationInput): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Title validation
  const trimmedTitle = input.title ? input.title.trim() : '';
  if (!trimmedTitle) {
    errors.title = 'Please enter a task title.';
  } else if (trimmedTitle.length < 3) {
    errors.title = 'Task title must contain at least 3 characters.';
  }

  // Description validation
  const trimmedDescription = input.description ? input.description.trim() : '';
  if (!trimmedDescription) {
    errors.description = 'Please enter a description.';
  }

  // Deadline validation
  if (!input.deadline) {
    errors.deadline = 'Please select a deadline.';
  } else {
    const deadlineDate = input.deadline instanceof Date ? input.deadline : new Date(input.deadline);
    if (isNaN(deadlineDate.getTime())) {
      errors.deadline = 'Please select a valid deadline date.';
    } else if (!input.isEditing && deadlineDate.getTime() < Date.now() - 60000) {
      // For new tasks, prevent past deadlines (allowing 1 min buffer)
      errors.deadline = 'Deadline cannot be in the past.';
    }
  }

  // Priority validation
  const validPriorities: TaskPriority[] = ['Low', 'Medium', 'High'];
  if (!input.priority || !validPriorities.includes(input.priority as TaskPriority)) {
    errors.priority = 'Please select a valid priority (Low, Medium, High).';
  }

  return errors;
};

/**
 * Helper to check if errors object has any errors.
 */
export const hasValidationErrors = (errors: ValidationErrors): boolean => {
  return Object.keys(errors).length > 0;
};
