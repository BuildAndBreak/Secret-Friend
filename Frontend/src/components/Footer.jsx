const year = new Date().getFullYear();

export default function Footer() {
  return (
    <footer>
      <small>
        &#169; {year} Secret Santa –{" "}
        <a href="https://social-links-buildandbreak.netlify.app/">
          Tiago Pereira
        </a>
      </small>
    </footer>
  );
}
