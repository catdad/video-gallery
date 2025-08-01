const root = '../api/v1';

export const list = `${root}/list`;

export const resource = str => `..${str}`;

export const video = str => `${root}/video/${str}`;
export const resizedVideo = (str, width) => `${root}/resize/${width}/${str}`; 
