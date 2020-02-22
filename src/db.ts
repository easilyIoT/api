import { connect } from 'mongoose';

import { DB_URL } from "./config"

export default connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });