import React, { useState } from "react";
import styles from "./Registration.module.css";
import { useCreateParticipantMutation } from "../../../../../../state/redux/participants/participantsApi";
import { useSelector } from "react-redux";
import { selectUser } from "../../../../../../state/redux/auth/authSlice";
import { toast } from "react-toastify";
import Button from "../../../../atoms/Button";
import Modal from "../../../../components/Modal/Modal";

const Registration = ({ event = {}, close }) => {
  const user = useSelector(selectUser);
  const [participant, setParticipant] = useState({
    event: event._id,
    leader: user?._id,
    members: [user?._id],
    teamName: "",
  });
  const [error, setError] = useState(null);
  const [membersInput, setMembersInput] = useState("");
  const [createParticipant] = useCreateParticipantMutation();

  const handleChange = (e) => {
    setParticipant({
      ...participant,
      [e.target.name]: e.target.value,
    });
  };

  const handleTeamMembersChange = (e) => {
    let members = e.target.value
      .split(",")
      .map((member) => member.trim())
      .filter((member) => member !== "");
    members = [...members, user._id];
    members = [...new Set(members)];
    if (members.length < event.minTeamSize) {
      setError(`Minimum team size is ${event.minTeamSize}`);
    } else if (members.length >= event.maxTeamSize) {
      // equal because leader is also a member
      setError(`Maximum team size is ${event.maxTeamSize}`);
    } else {
      setError(null);
    }
    setMembersInput(e.target.value);
    setParticipant({
      ...participant,
      members: members,
    });
  };

  const handleRemoveMember = (index) => {
    let members = participant.members.filter((_, i) => i !== index);
    members = [...members, user._id];
    members = [...new Set(members)];
    setMembersInput(members.join(", "));
    setParticipant({
      ...participant,
      members: members,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createParticipant(participant).unwrap();
      toast.success("Registered successfully");
      close();
    } catch (err) {
      setError(err.data?.message);
      toast.error(
        err.data?.message || err.error?.message || "Unable to register"
      );
    }
  };

  if (!event || !user) {
    return (
      <Modal
        title={!event ? "Event not found" : "Login to register"}
        close={close}
      />
    );
  }

  return (
    <Modal title={event.name} close={close}>
      <div className={styles.participantDetails}>
        <div className={styles.item}>
          <p className={styles.key}>
            {event.minTeamSize > 1 ? "Team Leader" : "Participant"}
          </p>
          <p className={styles.value}>{user.name}</p>
        </div>
        <div className={styles.item}>
          <p className={styles.key}>Contact Email</p>
          <p className={styles.value}>{user.email}</p>
        </div>
      </div>
      <form className={styles.form} onSubmit={handleSubmit}>
        {!event.feesInINR > 0 && false && (
          <div className={styles.formGroup}>
            <label htmlFor="promoCode">Promo Code</label>
            <input
              type="text"
              name="promoCode"
              id="promoCode"
              className={styles.input}
              onChange={handleChange}
            />
          </div>
        )}
        {event.minTeamSize > 1 && (
          <div className={styles.formGroup}>
            <label htmlFor="teamName">Team Name</label>
            <input
              type="text"
              name="teamName"
              id="teamName"
              required
              className={styles.input}
              onChange={handleChange}
            />
          </div>
        )}
        {event.minTeamSize > 1 && (
          <div className={styles.formGroup}>
            <label htmlFor="teamMembers">Team Members</label>
            <textarea
              type="text"
              name="teamMembers"
              id="teamMembers"
              className={styles.input}
              onChange={handleTeamMembersChange}
              value={membersInput}
              placeholder="Enter comma separated IDs of your team members."
            />
            <div className={styles.members}>
              {participant.members.map((member, index) => (
                <div className={styles.member} key={index}>
                  <div className={styles.name}>{member}</div>
                  <button
                    className={styles.remove}
                    onClick={() => handleRemoveMember(index)}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {event.feesInINR > 0 && (
          <div className={styles.formGroup}>
            <label htmlFor="promoCode">Promo Code</label>
            <input
              type="text"
              name="promoCode"
              id="promoCode"
              className={styles.input}
              onChange={handleChange}
            />
          </div>
        )}
        {error && <p className={styles.error}>{error}</p>}
        <Button variant="secondary" type="submit" className={styles.submit}>
          {event.feesInINR > 0 ? "Pay and Confirm" : "Confirm"}
        </Button>
      </form>
    </Modal>
  );
};

export default Registration;
