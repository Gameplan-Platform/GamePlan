import {
  EMAIL_REGEX,
  PASSWORD_REGEX,
  PASSWORD_ERROR_MESSAGE,
  REQUIRED_FIELDS_ERROR
} from "../constants/validation";

export type SignupInput = {
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    dob: string;
    password: string;
}

export type LoginInput = {
    identifier: string;
    password: string;
}

export function validateLogin(data: Record<string, unknown>): LoginInput {
  const { identifier, password } = data;

  if (typeof identifier !== "string" || typeof password !== "string") {
    throw new Error("Username/Email and Password are required");
  }

  const trimmedIdentifier = identifier.trim();
  const trimmedPassword = password.trim();

  if (!trimmedIdentifier || !trimmedPassword) {
    throw new Error("Username/Email and Password are required");
  }

  return {
    identifier: trimmedIdentifier,
    password: trimmedPassword,
  };
}

export function validateSignup(data: Record<string, unknown>): SignupInput {
    const { email, username, firstName, lastName, dob, password } = data;

    if (
    typeof email !== "string" ||
    typeof username !== "string" ||
    typeof firstName !== "string" ||
    typeof lastName !== "string" ||
    typeof dob !== "string" ||
    typeof password !== "string"
    ){
    throw new Error(REQUIRED_FIELDS_ERROR);
  }

  const trimmedEmail = email.trim();
  const trimmedUsername = username.trim();
  const trimmedFirstName = firstName.trim();
  const trimmedLastName = lastName.trim();
  const trimmedDob = dob.trim();
  const trimmedPassword = password.trim();

   if (
    !trimmedEmail ||
    !trimmedUsername ||
    !trimmedFirstName ||
    !trimmedLastName ||
    !trimmedDob ||
    !trimmedPassword
    ){
    throw new Error(REQUIRED_FIELDS_ERROR);
  }

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    throw new Error("Invalid email format");
  }

  if (!PASSWORD_REGEX.test(trimmedPassword)) {
    throw new Error(PASSWORD_ERROR_MESSAGE);
}

  const parsedDob = new Date(trimmedDob);
  if (Number.isNaN(parsedDob.getTime())) {
    throw new Error("Invalid date of birth");
  }

  return {
    email: trimmedEmail, 
    username: trimmedUsername,
    firstName: trimmedFirstName,
    lastName: trimmedLastName,
    dob: trimmedDob,
    password: trimmedPassword,
  };
}