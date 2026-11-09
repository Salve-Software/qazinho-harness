export const FILE_TEXT_IN_VIEW = `Array.from(document.querySelectorAll('section'))
  .filter((section) => {
    const box = section.getBoundingClientRect();

    return box.bottom > 0 && box.top < window.innerHeight;
  })
  .map((section) => section.innerText)
  .join('\\n\\n')`;
