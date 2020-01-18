const WeeksService = {
  getUserWeek(db, id) {
    return db
      .from('fitscribe_weeks')
      .select('*')
      .where('user_id', id)
      .first()
  },
  formatResponse(week) {
    return ({
      id: week.id,
      user_id: week.user_id,
      sunday_workout: week.sunday_workout,
      sunday_status: week.sunday_status,
      monday_workout: week.monday_workout,
      monday_status: week.monday_status,
      tuesday_workout: week.tuesday_workout,
      tuesday_status: week.tuesday_status,
      wednesday_workout: week.wednesday_workout,
      wednesday_status: week.wednesday_status,
      thursday_workout: week.thursday_workout,
      thursday_status: week.thursday_status,
      friday_workout: week.friday_workout,
      friday_status: week.friday_status,
      saturday_workout: week.saturday_workout,
      saturday_status: week.saturday_status
    })
  },
  updateWeek(db, id, updatedWeek) {
    return db('fitscribe_weeks')
      .where('id', id)
      .update(updatedWeek)
      .returning('*')
      .then(([week]) => week)
  }
}

module.exports = WeeksService