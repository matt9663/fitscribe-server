CREATE FUNCTION add_new_week() RETURNS TRIGGER AS
$BODY$
BEGIN
  INSERT INTO 
    fitscribe_weeks(user_id)
    VALUES(new.id);
    RETURN new;
END;
$BODY$
language plpgsql;

CREATE TRIGGER upon_new_user
  AFTER INSERT ON fitscribe_users
  FOR EACH ROW 
  EXECUTE PROCEDURE add_new_week();