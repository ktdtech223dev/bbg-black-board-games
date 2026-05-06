import CardFront from './CardFront';

export default function EventCard(props) {
  return <CardFront {...props} card={{ ...props.card, type: 'event' }} />;
}
